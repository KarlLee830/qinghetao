import isServer from '@common/utils/is-server';

export default function isSupportWebp() {
    let isSupportWebp = false;
    if (!isServer()) {
        try {
            const img = document.createElement('canvas').toDataURL('image/webp', 0.5);
            isSupportWebp = img.indexOf('data:image/webp') === 0;
        } catch(err) {
            isSupportWebp = false;
        }
    }
    return isSupportWebp;
}