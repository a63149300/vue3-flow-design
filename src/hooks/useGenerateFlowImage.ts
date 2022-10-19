import { reactive } from 'vue';
import canvg from 'canvg';
import html2canvas from 'html2canvas';
import { utils } from '/@/utils/common';

export function useGenerateFlowImage() {
  // 生成流程图片
  const flowImage = reactive({
    url: '',
    modalVisible: false,
    closable: false,
    maskClosable: false,
  });

  // 下载图片
  function downLoadFlowImage(id) {
    const alink = document.createElement('a');
    const alinkId = 'alink-' + utils.getId();
    alink.id = alinkId;
    alink.href = flowImage.url;
    alink.download = `流程设计图_${id}.png`;
    alink.click();
  }

  // 取消下载
  function cancelDownLoadFlowImage() {
    flowImage.url = '';
    flowImage.modalVisible = false;
  }

  // 计算流程图宽高
  function computeCanvasSize(nodeList) {
    let minX = nodeList[0].x;
    let minY = nodeList[0].y;
    let maxX = nodeList[0].x + nodeList[0].width;
    let maxY = nodeList[0].y + nodeList[0].height;

    nodeList.forEach((node: INode) => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });
    const canvasWidth = maxX - minX;
    const canvasHeight = maxY - minY;
    return {
      width: canvasWidth,
      height: canvasHeight,
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY,
    };
  }

  // 生成流程图片
  function generateFlowImage(nodeList, photoBlankDistance, checkFlow) {
    if (!checkFlow()) return;

    const $Container = document.querySelector('#flowContainer');
    const svgElems = $Container.querySelectorAll('svg[id^="link-"]');
    const removeArr: string[] = [];

    svgElems.forEach((svgElem: HTMLElement) => {
      const linkCanvas = document.createElement('canvas');
      const canvasId = 'linkCanvas-' + utils.getId();
      linkCanvas.id = canvasId;
      removeArr.push(canvasId);

      const svgContent = svgElem.outerHTML.trim();
      canvg(linkCanvas, svgContent);
      if (svgElem.style.position) {
        linkCanvas.style.position += svgElem.style.position;
        linkCanvas.style.left += svgElem.style.left;
        linkCanvas.style.top += svgElem.style.top;
      }
      $Container.appendChild(linkCanvas);
    });

    $Container?.querySelectorAll('svg').forEach((item) => {
      item.style.display = 'none';
    });

    const canvasSize = computeCanvasSize(nodeList);

    const offsetPbd = utils.div(photoBlankDistance, 2);

    html2canvas($Container, {
      width: canvasSize.maxX + offsetPbd,
      height: canvasSize.maxY + offsetPbd,
      scrollX: 0,
      scrollY: 0,
      logging: false,
      onclone: () => {
        removeArr.forEach((id) => {
          const currentNode = document.querySelector('#' + id);
          currentNode?.parentNode?.removeChild(currentNode);
        });

        $Container?.querySelectorAll('svg').forEach((item) => {
          item.style.display = 'inline-block';
        });
      },
    }).then((canvas) => {
      const dataURL = canvas.toDataURL('image/png');
      flowImage.url = dataURL;
      flowImage.modalVisible = true;
    });
  }

  return {
    flowImage,
    downLoadFlowImage,
    cancelDownLoadFlowImage,
    generateFlowImage,
  };
}
