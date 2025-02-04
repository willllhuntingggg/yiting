import { EXPORT_IMAGE_DIMENSIONS } from '../constants/image';
import html2canvas from 'html2canvas';

export async function exportImage(element: HTMLElement) {
  // 创建一个临时的渲染容器
  const renderContainer = document.createElement('div');
  renderContainer.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: ${EXPORT_IMAGE_DIMENSIONS.width}px;
    height: ${EXPORT_IMAGE_DIMENSIONS.height}px;
    overflow: hidden;
  `;
  
  try {
    // 克隆要导出的内容
    const clonedElement = element.cloneNode(true) as HTMLElement;
    renderContainer.appendChild(clonedElement);
    document.body.appendChild(renderContainer);
    
    // 设置克隆元素的样式
    clonedElement.style.cssText = `
      width: 100% !important;
      height: 100% !important;
      display: block !important;
      position: relative !important;
      transform: none !important;
      margin: 0 !important;
      padding: 0 !important;
    `;
    
    // 等待内容渲染
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const canvas = await html2canvas(clonedElement, {
      width: EXPORT_IMAGE_DIMENSIONS.width,
      height: EXPORT_IMAGE_DIMENSIONS.height,
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: true, // 开启日志以便调试
      windowWidth: EXPORT_IMAGE_DIMENSIONS.width,
      windowHeight: EXPORT_IMAGE_DIMENSIONS.height,
      scrollX: 0,
      scrollY: 0,
      // 添加调试信息
      onclone: (document, element) => {
        console.log('Cloned element dimensions:', {
          width: element.offsetWidth,
          height: element.offsetHeight,
          scrollHeight: element.scrollHeight
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