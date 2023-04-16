import styles from './index.module.scss';
export default function SiteMapLink(props) {
    const { href, text = '' } = props;
    const content = text ? text.slice(0, 20) : '';
    return (
        <a href={href} className={styles['site-map-link']} title={content}>{content}</a>
    );

}