import * as Sentry from '@sentry/react';
import config from '@common/config/sentry';
export default function initSentry() {
    Sentry.init(config);
}