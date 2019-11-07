# id3tag-rss
Generate RSS feed easily from the id3tag information in the mp3 files.   

## Quick Start

```javascript
const rss = required('id3tag-rss')

const builder = rss.builder()

builder.setInfo({
    title: 'My Greatest Podcast',
    description: 'You will never bored, you can listen for hours!',
    baseUrl: 'https://greatests.pod/podcasts',
    author: 'Louwe Brown',
    image_url: 'https://greatests.pod/thumb.jpg'
})

builder.setSourcePath('./data/mp3')

builder.sortItems((item1, item2) => {
    if (item1.createDate > item2.createDate) return 1
    return -1
})

builder.enrichItem((item, id3tags) => {
    item.author = 'Louwe Green'
})

builder.create().then(xml => {
    console.log(xml)
})
```