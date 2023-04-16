import { action } from 'mobx';
import IndexStore from './store';
import { readEmoji } from '@common/server';
import Storage from '@common/utils/session-storage';

class IndexAction extends IndexStore {
    constructor(props) {
      super(props);

      this.storage = new Storage({ storageType: 'local' });
    }

    // 设置表情
    @action.bound
    setEmoji(data) {
        this.emojis = data;
        if (this.storage) {
            this.storage.set('DZQ_EMOJI', JSON.stringify(data));
        }
    }

    async fetchEmoji() {
        const ret = await readEmoji();
        const { code, data = [] } = ret;
        let emojis = [];
        if (code === 0) emojis = data.map(item => ({ code: item.code, url: item.url }));
        this.setEmoji(emojis);
        return ret;
    }

    async asyncGetEmoji() {
        if (!this.emojis?.length && this.storage) {
            const emojis = JSON.parse(this.storage.get('DZQ_EMOJI') || `{}`);
            if (!emojis?.length) {
                await fetchEmoji()
                return this.emojis
            }

            return emojis
        }

        return this.emojis
    }
}

export default IndexAction;