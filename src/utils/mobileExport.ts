import { EXPORT_IMAGE_DIMENSIONS } from '../constants/image';
import html2canvas from 'html2canvas';

export async function handleMobileExport(element: HTMLElement) {
  // 创建临时渲染容器
  const renderContainer = document.createElement('div');
  renderContainer.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: ${EXPORT_IMAGE_DIMENSIONS.width}px;
    height: ${EXPORT_IMAGE_DIMENSIONS.height}px;
    overflow: hidden;
    -webkit-text-size-adjust: none;
  `;
  
  try {
    // 克隆要导出的内容
    const clonedElement = element.cloneNode(true) as HTMLElement;
    renderContainer.appendChild(clonedElement);
    document.body.appendChild(renderContainer);
    
    // 处理克隆元素中的所有内容
    const processElement = (el: HTMLElement) => {
      // 保持图片比例
      if (el.tagName === 'IMG') {
        el.style.maxWidth = '100%';
        el.style.height = 'auto';
        el.style.objectFit = 'contain';
      }
      
      // 处理文本换行
      el.style.wordWrap = 'break-word';
      el.style.whiteSpace = 'pre-wrap';
      
      // 递归处理子元素
      Array.from(el.children).forEach(child => {
        processElement(child as HTMLElement);
      });
    };
    
    processElement(clonedElement);
    
    // 设置克隆元素的基本样式
    clonedElement.style.cssText = `
      width: 100% !important;
      height: 100% !important;
      display: block !important;
      position: relative !important;
      transform: none !important;
      margin: 0 !important;
      padding: 0 !important;
      -webkit-text-size-adjust: none !important;
    `;
    
    // 等待内容渲染和图片加载
    await Promise.all([
      new Promise(resolve => setTimeout(resolve, 200)),
      ...Array.from(clonedElement.getElementsByTagName('img'))
        .map(img => new Promise(resolve => {
          if (img.complete) resolve(null);
          else img.onload = resolve;
        }))
    ]);
    
    console.log('Before capture:', {
      containerWidth: renderContainer.offsetWidth,
      containerHeight: renderContainer.offsetHeight,
      contentWidth: clonedElement.offsetWidth,
      contentHeight: clonedElement.scrollHeight
    });
    
    const canvas = await html2canvas(clonedElement, {
      width: EXPORT_IMAGE_DIMENSIONS.width,
      height: EXPORT_IMAGE_DIMENSIONS.height,
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: true,
      windowWidth: EXPORT_IMAGE_DIMENSIONS.width,
      windowHeight: EXPORT_IMAGE_DIMENSIONS.height,
      scrollX: 0,
      scrollY: 0,
      onclone: (doc, element) => {
        console.log('Cloned dimensions:', {
          width: element.offsetWidth,
          height: element.offsetHeight
        });
      }
    });
    
    const image = canvas.toDataURL('image/png');
    return image;
  } finally {
    // 清理临时容器
    if (renderContainer.parentNode) {
      renderContainer.parentNode.removeChild(renderContainer);
    }
  }
} 