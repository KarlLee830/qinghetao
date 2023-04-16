import BaseLayout from '@components/base-layout';
import styles from './placeholder.module.scss';

export default function Placeholder() {
    return (
        <BaseLayout
            showRefresh={false} 
            className="home"
            noHeader
            left={() =>
                <div style={{width: '100%'}}>
                    <div className={styles.leftPlaceholder}>
                        <div className={styles.content}/>
                        <div className={styles.content}/>
                        <div className={styles.content}/>
                        <div className={styles.content}/>
                        <div className={styles.content}/>
                    </div>
                </div>
            }
            right={() =>
                <div style={{width: '100%'}}>
                    <div className={styles.rightPlaceholder}>
                        <div className={styles.content}/>
                        <div className={styles.content}/>
                        <div className={styles.content}/>
                        <div className={styles.content}/>
                        <div className={styles.content}/>
                    </div>
                </div>
            }
        >
        <div style={{width: '100%'}}>
            <div className={styles.placeholder}>
                <div className={styles.header}>
                    <div className={styles.avatar}/>
                    <div className={styles.box}/>
                </div>
                <div className={styles.content}/>
                <div className={styles.content}/>
                <div className={styles.footer}>
                    <div className={styles.box}/>
                    <div className={styles.box}/>
                    <div className={styles.box}/>
                </div>
                </div>
                <div className={styles.placeholder}>
                <div className={styles.header}>
                    <div className={styles.avatar}/>
                    <div className={styles.box}/>
                </div>
                <div className={styles.content}/>
                <div className={styles.content}/>
                <div className={styles.footer}>
                    <div className={styles.box}/>
                    <div className={styles.box}/>
                    <div className={styles.box}/>
                </div>
            </div>
        </div>
        </BaseLayout>
    );
} 