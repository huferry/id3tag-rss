const fs = require('fs').promises
const path = require('path')
const ffmetadata = require('ffmetadata')
const podcast = require('podcast2')

function getId3Tag(file) {
    return new Promise((resolve, reject) => {
        ffmetadata.read(file, (err, data) => {
            if (err) reject(err)
            else resolve(data)
        })
    })
}

async function getFiles(mp3path) {
    const files = await fs.readdir(mp3path)
    return files
        .filter(f => f.match(/\.mp3$/i))
        .map(file => path.join(mp3path, file))
}

async function createItem(rssInfo, mp3file, enrichFn) {
    const id3tags = await getId3Tag(mp3file)
    const fileName = path.basename(mp3file)
    const stat = await fs.stat(mp3file)
    const link = `${rssInfo.baseUrl}/${fileName}`
    const title = id3tags.title || path.basename(mp3file, 'mp3')
    
    const item = {
        title: title,
        description: id3tags.comment || '',
        url: link,
        author: id3tags.artist || '',
        date: stat.mtime,
        enclosure: {url: link, file: mp3file },
        itunesAuthor: id3tags.artist || '',
        itunesExplicit: false,
        itunesSubtitle: '',
        itunesSummary: id3tags.comment || '',
        itunesKeywords: []
    }
    
    enrichFn(item, id3tags)

    return item
}

const builder = () => {

    const builder = {
        enrichFn: item => item,
        compareFn: (item1, item2) => 0
    }

    builder.setInfo = (info) => {
        builder.info = info
        return builder
    }

    builder.setSourcePath = (sourcePath) => {
        builder.sourcePath = sourcePath
        return builder
    }

    builder.sortItems = (compareFn) => {
        builder.compareFn = compareFn
        return builder
    }

    builder.enrichItem = (enrichFn) => {
        builder.enrichFn = enrichFn
        return builder
    }

    builder.create = async () => {
        if (!builder.sourcePath) throw new Error('Please set the sourcePath.')

        const files = await getFiles(builder.sourcePath)
        const items = (await Promise.all(
                files.map(
                    file => createItem(
                        builder.info, 
                        file, 
                        builder.enrichFn))))

        items.sort(builder.compareFn)

        return podcast(builder.info, items)
    }

    return builder
}

module.exports = {
    builder
}