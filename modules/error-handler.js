/**
 * ErrorHandler - User-facing error notification system
 * Displays toast notifications and alert modals for errors
 */

import { ERROR_MESSAGES } from './error-messages.js';

export class ErrorHandler {
    static toastQueue = [];
    static activeToasts = [];
    static maxToasts = 3;

    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {Object} options - Configuration options
     * @param {number} options.duration - Auto-dismiss duration in ms (default: 5000)
     * @param {string} options.type - Toast type: 'error'|'warning'|'info' (default: 'error')
     */
    static showToast(message, options = {}) {
        const { duration = 5000, type = 'error' } = options;

        // Create toast container if it doesn't exist
        let container = document.getElementById('falter-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'falter-toast-container';
            document.body.appendChild(container);
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `falter-toast falter-toast-${type}`;

        const iconMap = {
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <div class="toast-icon">${iconMap[type]}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" title="Dismiss">&times;</button>
        `;

        // Add to container
        container.appendChild(toast);
        this.activeToasts.push(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('toast-show');
        });

        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.dismissToast(toast);
        });

        // Auto-dismiss after duration
        if (duration > 0) {
            setTimeout(() => {
                this.dismissToast(toast);
            }, duration);
        }

        // Limit number of active toasts
        if (this.activeToasts.length > this.maxToasts) {
            this.dismissToast(this.activeToasts[0]);
        }

        return toast;
    }

    /**
     * Dismiss a specific toast
     */
    static dismissToast(toast) {
        if (!toast || !toast.parentElement) return;

        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
            const index = this.activeToasts.indexOf(toast);
            if (index > -1) {
                this.activeToasts.splice(index, 1);
            }
        }, 300);
    }

    /**
     * Show an alert modal (blocking dialog)
     * @param {string} message - The message to display
     * @param {Object} options - Configuration options
     * @param {string} options.title - Alert title (default: 'Error')
     * @param {Array} options.actions - Action buttons [{label, callback}]
     */
    static showAlert(message, options = {}) {
        const { title = 'Error', actions = [] } = options;

        // Create alert overlay
        const alert = document.createElement('div');
        alert.className = 'falter-alert-overlay';

        // Build actions HTML
        let actionsHTML = '';
        if (actions.length > 0) {
            actionsHTML = '<div class="alert-actions">';
            actions.forEach((action, index) => {
                actionsHTML += `<button class="alert-action" data-action-index="${index}">${action.label}</button>`;
            });
            actionsHTML += '</div>';
        } else {
            actionsHTML = '<div class="alert-actions"><button class="alert-action alert-action-primary">OK</button></div>';
        }

        alert.innerHTML = `
            <div class="falter-alert">
                <div class="alert-header">
                    <h3>${title}</h3>
                    <button class="alert-close" title="Close">&times;</button>
                </div>
                <div class="alert-body">
                    <p>${message}</p>
                </div>
                ${actionsHTML}
            </div>
        `;

        document.body.appendChild(alert);

        // Trigger animation
        requestAnimationFrame(() => {
            alert.classList.add('alert-show');
        });

        // Close button handler
        const closeBtn = alert.querySelector('.alert-close');
        closeBtn.addEventListener('click', () => {
            this.dismissAlert(alert);
        });

        // Action button handlers
        const actionBtns = alert.querySelectorAll('.alert-action');
        actionBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                if (actions[index] && actions[index].callback) {
                    actions[index].callback();
                }
                this.dismissAlert(alert);
            });
        });

        // Click outside to close
        alert.addEventListener('click', (e) => {
            if (e.target === alert) {
                this.dismissAlert(alert);
            }
        });

        return alert;
    }

    /**
     * Dismiss alert modal
     */
    static dismissAlert(alert) {
        if (!alert || !alert.parentElement) return;

        alert.classList.remove('alert-show');
        alert.classList.add('alert-hide');

        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 300);
    }

    /**
     * Show geocoding error summary
     */
    static showGeocodingError(failedCount, totalCount) {
        const message = ERROR_MESSAGES.geocodingPartialFailure
            .replace('{failedCount}', failedCount)
            .replace('{totalCount}', totalCount);

        this.showToast(message, {
            type: 'warning',
            duration: 5000
        });
    }

    /**
     * Show network error with retry option
     */
    static showNetworkError(retryCallback) {
        const actions = retryCallback ? [
            { label: 'Retry', callback: retryCallback },
            { label: 'Cancel', callback: () => {} }
        ] : [];

        this.showAlert(ERROR_MESSAGES.networkError, {
            title: 'Connection Error',
            actions
        });
    }

    /**
     * Show rate limit error
     */
    static showRateLimitError(waitSeconds) {
        const message = ERROR_MESSAGES.rateLimitError
            .replace('{seconds}', waitSeconds);

        this.showToast(message, {
            type: 'warning',
            duration: waitSeconds * 1000
        });
    }

    /**
     * Show map initialization error
     */
    static showMapError() {
        this.showAlert(ERROR_MESSAGES.mapInitError, {
            title: 'Map Error'
        });
    }

    /**
     * Show parsing error
     */
    static showParsingError() {
        this.showAlert(ERROR_MESSAGES.parsingError, {
            title: 'Data Error'
        });
    }

    /**
     * Dismiss all active notifications
     */
    static dismissAll() {
        // Dismiss all toasts
        this.activeToasts.forEach(toast => this.dismissToast(toast));
        this.activeToasts = [];

        // Dismiss all alerts
        const alerts = document.querySelectorAll('.falter-alert-overlay');
        alerts.forEach(alert => this.dismissAlert(alert));
    }
}
