import { IMG_SRC_HOST } from '@common/constants/site';
//
/**
 *
 * 根据文件类型得到附件中的图标的链接
 *
*/
export default function getAttachmentIconLink(type) {
  let iconLink = "";
  switch (type) {
    case 'XLS':
    case 'XLSX':
    case 'SHEET':
      iconLink = "xls-outlined.86ffbb304f441a3ac39d0a2b6559d119a876b992.png";
      break;
    case 'DOC':
    case 'DOCX':
    case 'DOCUMENT':
      iconLink = "doc-outlined.2c3f996d6c8e141beea3a4dd2e4f92e72927241c.png";
      break;
    case 'PPT':
    case 'PPTX':
    case 'PRESENTATION':
      iconLink = "ppt-outlined.c633840874bf2f06dd0dddc96f19f2698619e51e.png";
      break;
    case 'RAR':
    case 'ZIP':
    case 'X-ZIP-COMPRESSED':
      iconLink = "zip-outlined.8c5d95e8746ea9a5b940a03e8f83d5b1ddba0211.png";
      break;
    case 'PDF':
      iconLink = "pdf-outlined.e06cb6e0559e2f2abebaa07a54ff3b34b05a4165.png";
      break;
    case 'TXT':
    case 'PLAIN':
      iconLink = "text-outlined.3422bac383a7d71bba912db8b3912471ec2869f6.png";
      break;
    case 'MP4':
      iconLink = "video-outlined.75403451dd41be304dfcbefd530ec1d560f978f4.png";
      break;
    case 'M4A':
    case 'MP3':
    case 'MPEG':
      iconLink = "audio-outlined.d04f8b9380204fe1b1b671f59145695f56cc222d.png";
      break;
    case 'PNG':
    case 'JPEG':
      iconLink = "image-outlined.8aa1c2bd1fb9a0645e09136670cfb4020aa30be3.png";
      break;
    case 'FORM':
      iconLink = "form-outlined.7edcdca23038bdd7f2b72f2b897388e5d8acb79f.png";
      break;
    default:
      iconLink = "file-outlined.8dafcd0a20ee70430ba1d3420e015a232a64fa05.png";
      break;
  }
  return `${IMG_SRC_HOST}/assets/${iconLink}`;
}
