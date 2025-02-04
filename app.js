// 专辑数据
const albums = [
    { name: 'Jay', year: 2000 },
    { name: '范特西', year: 2001 },
    { name: '八度空间', year: 2002 },
    { name: '叶惠美', year: 2003 },
    { name: '七里香', year: 2004 },
    { name: '11月的萧邦', year: 2005 },
    { name: '依然范特西', year: 2006 },
    { name: '我很忙', year: 2007 },
    { name: '魔杰座', year: 2008 },
    { name: '跨时代', year: 2010 },
    { name: '惊叹号', year: 2011 },
    { name: '12新作', year: 2012 },
    { name: '哎呦，不错哦', year: 2014 },
    { name: '周杰伦的床边故事', year: 2016 },
    { name: '最伟大的作品', year: 2022 }
];

// 存储听过的歌曲
let listenedSongs = new Set();

// 从localStorage加载听过的歌曲
function loadListenedSongs() {
    const saved = localStorage.getItem('listenedSongs');
    if (saved) {
        listenedSongs = new Set(JSON.parse(saved));
    }
}

// 保存听过的歌曲到localStorage
function saveListenedSongs() {
    localStorage.setItem('listenedSongs', JSON.stringify([...listenedSongs]));
}

// 获取所有歌曲总数
function getTotalSongCount() {
    return Object.values(jayChowAlbums).reduce((total, songs) => total + songs.length, 0);
}

// 创建歌曲元素
function createSongElement(song) {
    const div = document.createElement('div');
    div.className = 'song-item';
    div.textContent = song;
    
    if (listenedSongs.has(song)) {
        div.classList.add('listened');
    }
    
    // 鼠标按下事件
    div.addEventListener('mousedown', (e) => {
        isDragging = true;
        startElement = div;
        // 根据当前状态决定是标记还是取消标记
        isDraggingToMark = !div.classList.contains('listened');
    });
    
    // 触摸开始事件
    div.addEventListener('touchstart', (e) => {
        isDragging = true;
        startElement = div;
        isDraggingToMark = !div.classList.contains('listened');
        e.preventDefault(); // 防止触发鼠标事件
    });
    
    // 鼠标/触摸移动到元素上
    div.addEventListener('mouseenter', (e) => {
        if (isDragging && startElement) {
            markSongsBetween(startElement, div, isDraggingToMark);
            saveListenedSongs();
            updateExportButton();
        }
    });
    
    div.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element && element.classList.contains('song-item')) {
            markSongsBetween(startElement, element, isDraggingToMark);
            saveListenedSongs();
            updateExportButton();
        }
        
        e.preventDefault();
    });
    
    // 点击处理
    div.addEventListener('click', (e) => {
        if (e.shiftKey && lastClickedSong) {
            const allSongs = Array.from(document.querySelectorAll('.song-item'));
            const lastIndex = allSongs.findIndex(el => el.textContent === lastClickedSong);
            const currentIndex = allSongs.findIndex(el => el.textContent === song);
            
            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);
            
            const isMarking = !div.classList.contains('listened');
            for (let i = start; i <= end; i++) {
                const songElement = allSongs[i];
                toggleSongListened(songElement, isMarking);
            }
        } else if (e.ctrlKey || e.metaKey) {
            toggleSongListened(div, !div.classList.contains('listened'));
        } else {
            toggleSongListened(div, !div.classList.contains('listened'));
        }
        
        lastClickedSong = song;
        saveListenedSongs();
        updateExportButton();
    });
    
    return div;
}

// 渲染所有专辑
function renderAlbums() {
    const container = document.getElementById('albums-container');
    container.innerHTML = '';
    
    albums.forEach(album => {
        const albumDiv = document.createElement('div');
        albumDiv.className = 'album-container';
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'album-title';
        titleDiv.textContent = `${album.name} (${album.year})`;
        
        const songsDiv = document.createElement('div');
        songsDiv.className = 'song-grid';
        
        const songs = jayChowAlbums[album.name];
        songs.forEach(song => {
            songsDiv.appendChild(createSongElement(song));
        });
        
        albumDiv.appendChild(titleDiv);
        albumDiv.appendChild(songsDiv);
        container.appendChild(albumDiv);
    });
}

// 更新导出按钮文本
function updateExportButton() {
    const exportBtn = document.getElementById('export-btn');
    exportBtn.textContent = `导出图片 (${listenedSongs.size}/${getTotalSongCount()})`;
}

// 创建导出区域
function createExportArea() {
    const exportArea = document.createElement('div');
    exportArea.style.cssText = 'background: white; padding: 40px; font-family: Arial; font-size: 24px; line-height: 2.5;';
    
    albums.forEach(album => {
        const albumTitle = document.createElement('div');
        albumTitle.style.cssText = 'font-weight: bold; margin-top: 20px; margin-bottom: 10px;';
        albumTitle.textContent = `${album.name} (${album.year})`;
        exportArea.appendChild(albumTitle);
        
        const songs = jayChowAlbums[album.name];
        songs.forEach(song => {
            const songDiv = document.createElement('div');
            songDiv.style.cssText = 'display: inline-block; margin-right: 20px; margin-bottom: 10px;';
            songDiv.textContent = song;
            
            if (listenedSongs.has(song)) {
                songDiv.style.background = 'linear-gradient(transparent 60%, #98FB98 40%)';
            }
            
            exportArea.appendChild(songDiv);
        });
    });
    
    return exportArea;
}

// 初始化
let lastClickedSong = null;
let isDragging = false;
let startElement = null;
let isDraggingToMark = false;

// 处理歌曲标记
function toggleSongListened(element, marking) {
    if (marking) {
        element.classList.add('listened');
        listenedSongs.add(element.textContent);
    } else {
        element.classList.remove('listened');
        listenedSongs.delete(element.textContent);
    }
}

// 标记范围内的歌曲
function markSongsBetween(start, end, marking) {
    const allSongs = Array.from(document.querySelectorAll('.song-item'));
    const startIndex = allSongs.indexOf(start);
    const endIndex = allSongs.indexOf(end);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const min = Math.min(startIndex, endIndex);
    const max = Math.max(startIndex, endIndex);
    
    for (let i = min; i <= max; i++) {
        toggleSongListened(allSongs[i], marking);
    }
}

// 添加全局事件监听
document.addEventListener('mouseup', () => {
    isDragging = false;
    startElement = null;
});

document.addEventListener('touchend', () => {
    isDragging = false;
    startElement = null;
});

document.addEventListener('touchcancel', () => {
    isDragging = false;
    startElement = null;
});

document.addEventListener('DOMContentLoaded', () => {
    // 清空localStorage和已听歌曲集合
    localStorage.removeItem('listenedSongs');
    listenedSongs.clear();
    
    // 渲染专辑
    renderAlbums();
    updateExportButton();
    
    // 全选按钮
    document.getElementById('select-all').addEventListener('click', () => {
        // 遍历所有专辑和歌曲
        Object.values(jayChowAlbums).forEach(songs => {
            songs.forEach(song => {
                listenedSongs.add(song);
            });
        });
        
        // 更新UI
        document.querySelectorAll('.song-item').forEach(el => {
            el.classList.add('listened');
        });
        
        // 保存状态并更新导出按钮
        saveListenedSongs();
        updateExportButton();
    });
    
    // 清除选择按钮
    document.getElementById('clear-selection').addEventListener('click', () => {
        // 清除所有已听状态
        document.querySelectorAll('.song-item').forEach(el => {
            el.classList.remove('listened');
        });
        
        // 清空集合
        listenedSongs.clear();
        
        // 保存状态并更新导出按钮
        saveListenedSongs();
        updateExportButton();
    });
    
    // 导出按钮
    document.getElementById('export-btn').addEventListener('click', async () => {
        const exportArea = createExportArea();
        document.body.appendChild(exportArea);
        
        try {
            const canvas = await html2canvas(exportArea);
            const link = document.createElement('a');
            link.download = '周杰伦歌单.png';
            link.href = canvas.toDataURL();
            link.click();
        } finally {
            document.body.removeChild(exportArea);
        }
    });
});
