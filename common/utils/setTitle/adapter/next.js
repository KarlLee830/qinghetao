export default function setTitle(title = '') {
    if ( title === '' && document.title && document.title != '') {
        document.title = document.title;
    } else {
        document.title = title && title !== '' ? title : '欢迎您';
    }
}