// ==UserScript==
// @name         Enhanced WIMS Interface
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Streamlines WIMS case management with quick action buttons
// @author       camrees
// @match        https://optimus-internal-eu.amazon.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // ========== STYLES ==========
    const CONTAINER_STYLES = {
        position: 'fixed',
        bottom: '0',
        left: '0',
        width: '100vw',
        height: '70px',
        background: '#1f1f1f',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
        zIndex: '9998',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
        transition: 'transform 0.3s',
    };

    const BUTTON_STYLES = {
        flex: '1 1 0',
        height: '90%',
        margin: '0 4px',
        background: '#2196F3',
        color: 'white',
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '13px',
        transition: 'background-color 0.2s',
        whiteSpace: 'normal',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    };

    const POPUP_STYLES = {
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#222',
        color: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        zIndex: '10000',
        minWidth: '600px',
        maxWidth: '90vw',
        padding: '24px 16px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        display: 'flex',
        flexDirection: 'row',
        gap: '24px',
    };

    // ========== DATA STRUCTURE EXAMPLES ==========
    // Example button data structure
    // Each button can have multiple actions (for popup), each with raisedBy, blurb, snooze, etc.
    const buttonActions = [
        {
            name: "Missing Drop",
            actions: [
                {
                    label: "12-6h to SAT",
                    raisedBy: "Carrier",
                    category: "PS_DM_FL",
                    status: "Pending Carrier Action",
                    subject: "★ Missing Drop ★",
                    blurb: "Carrier raised: Please investigate missing drop.",
                    snooze: 1 // hours
                },
                {
                    label: "12-6h to SAT",
                    raisedBy: "Site",
                    category: "PS_DM_FL",
                    status: "Pending Amazon Action",
                    subject: "★ Missing Drop ★",
                    blurb: "Site raised: Please investigate missing drop.",
                    snooze: 1 // hours
                }
            ]
        },
        {
            name: "Close Case",
            actions: [
                {
                    label: "Standard Close",
                    raisedBy: "Site",
                    category: "PS_DM_FL",
                    status: "Resolved",
                    subject: "★ Case Resolved ★",
                    blurb: "Thank you for the updates, closing case.\n\nPlease reopen if any further support is required.",
                    snooze: null
                }
            ]
        },
        // ...add more buttons/actions as needed...
    ];

    // ========== DOM HELPERS ==========
    function applyStyles(element, styles) {
        Object.assign(element.style, styles);
    }

    // ========== ELEMENT GETTERS ==========
    function getElement(document, path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
    function getAddSubjectIframe() {
        return getElement(document, "//iframe[contains(@class, 'resolution-widget-container')]");
    }
    function getAddSubjectIframeDoc() {
        const iframe = getAddSubjectIframe();
        return iframe ? (iframe.contentDocument || iframe.contentWindow.document) : null;
    }
    function getAddSubject() {
        const doc = getAddSubjectIframeDoc();
        return doc ? getElement(doc, "//input[@placeholder='Add to subject']") : null;
    }
    function getCategory() {
        const doc = getAddSubjectIframeDoc();
        return doc ? getElement(doc, "//select[@name='category']") : null;
    }
    function getReplyTextbox() {
        const doc = getAddSubjectIframeDoc();
        return doc ? getElement(doc, "//textarea[@placeholder='Reply to this case...']") : null;
    }
    function getStatusDropdown() {
        const doc = getAddSubjectIframeDoc();
        return doc ? getElement(doc, "//select[@name='status']") : null;
    }
    function getFollowUpDatetime() {
        const doc = getAddSubjectIframeDoc();
        return doc ? getElement(doc, "//input[@name='dueDate' and @type='datetime-local']") : null;
    }
    function getAssignButton() {
        return getElement(document, "//button[text()='Assign to me']");
    }
    function getReplyToCase() {
        const doc = getAddSubjectIframeDoc();
        return doc ? getElement(doc, "//input[@placeholder='Reply to this case...']") : null;
    }
    function getReplyButton() {
        const doc = getAddSubjectIframeDoc();
        return doc ? getElement(doc, "//a[text()='Case Reply']") : null;
    }

    // ========== REACT INPUT HELPERS ==========
    function setReactInputValue(input, value) {
        if (!input) return;
        let lastValue = input.value;
        input.value = value;
        let event = new Event('input', { bubbles: true });
        event.simulated = true;
        let tracker = input._valueTracker;
        if (tracker) {
            tracker.setValue(lastValue);
        }
        input.dispatchEvent(event);
    }
    function setReactSelectValue(selectElement, newValue) {
        if (!selectElement) return;
        let setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
        setter.call(selectElement, newValue);
        const event = new Event('change', { bubbles: true });
        selectElement.dispatchEvent(event);
    }
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // ========== POPUP UI ==========
    function showSplitPopup(actions, onSelect) {
        // Remove any existing popup
        const existing = document.querySelector('.wims-enhancer-popup');
        if (existing) existing.remove();

        // Create popup
        const popup = document.createElement('div');
        popup.classList.add('wims-enhancer-popup');
        applyStyles(popup, POPUP_STYLES);

        // Split actions by raisedBy
        const carrierActions = actions.filter(a => a.raisedBy === "Carrier");
        const siteActions = actions.filter(a => a.raisedBy === "Site");

        // Create columns
        const colStyle = "flex:1;display:flex;flex-direction:column;gap:12px;";
        const dividerStyle = "width:2px;background:#444;margin:0 12px;";

        const carrierCol = document.createElement('div');
        carrierCol.style = colStyle;
        carrierCol.innerHTML = `<div style="font-weight:bold;margin-bottom:8px;">Carrier Raised</div>`;
        carrierActions.forEach(action => {
            const btn = document.createElement('button');
            btn.textContent = action.label;
            btn.style = "margin-bottom:8px;padding:12px;background:#1976D2;color:#fff;border:none;border-radius:4px;cursor:pointer;";
            btn.onclick = () => {
                popup.remove();
                onSelect(action);
            };
            carrierCol.appendChild(btn);
        });

        const siteCol = document.createElement('div');
        siteCol.style = colStyle;
        siteCol.innerHTML = `<div style="font-weight:bold;margin-bottom:8px;">Site Raised</div>`;
        siteActions.forEach(action => {
            const btn = document.createElement('button');
            btn.textContent = action.label;
            btn.style = "margin-bottom:8px;padding:12px;background:#2196F3;color:#fff;border:none;border-radius:4px;cursor:pointer;";
            btn.onclick = () => {
                popup.remove();
                onSelect(action);
            };
            siteCol.appendChild(btn);
        });

        // Divider
        const divider = document.createElement('div');
        divider.style = dividerStyle;

        // Assemble
        popup.appendChild(carrierCol);
        popup.appendChild(divider);
        popup.appendChild(siteCol);

        document.body.appendChild(popup);
    }

    // ========== MAIN BUTTON ACTION ==========
    async function handleButtonAction(action) {
        try {
            // Assign to me if needed
            const assignButton = getAssignButton();
            if (assignButton && assignButton.textContent === "Assign to me") {
                assignButton.click();
                await delay(500);
            }
            // Open reply
            const replyToCase = getReplyToCase();
            if (replyToCase) {
                replyToCase.focus();
                await delay(300);
            }
            const replyButton = getReplyButton();
            if (replyButton) {
                replyButton.click();
                await delay(300);
            }
            // Set fields
            const category = getCategory();
            if (category) setReactSelectValue(category, action.category);
            const subject = getAddSubject();
            if (subject) setReactInputValue(subject, action.subject);
            const replyTextBox = getReplyTextbox();
            if (replyTextBox) setReactInputValue(replyTextBox, action.blurb);
            const statusDropdown = getStatusDropdown();
            if (statusDropdown) setReactSelectValue(statusDropdown, action.status);

            // Set snooze if needed
            if (action.snooze) {
                const followUpDatetime = getFollowUpDatetime();
                if (followUpDatetime) {
                    function pad(number) { return (number < 10) ? '0' + number : number; }
                    let date = new Date();
                    date.setTime(date.getTime() + action.snooze * 60 * 60 * 1000);
                    const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
                    setReactInputValue(followUpDatetime, formattedDate);
                }
            }
            // Show confirmation
            showPopup(`Applied: ${action.subject}`);
        } catch (error) {
            console.error('Error applying action:', error);
            showPopup('Error applying action. Please try again.', true);
        }
    }

    // ========== SIMPLE POPUP ==========
    function showPopup(message, isError = false) {
        // Remove any existing popup
        const existingPopup = document.querySelector('.wims-enhancer-popup');
        if (existingPopup) existingPopup.remove();

        // Create popup
        const popup = document.createElement('div');
        popup.classList.add('wims-enhancer-popup');
        Object.assign(popup.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '35px',
            background: '#000000',
            color: '#ffffff',
            borderLeft: isError ? '4px solid #F44336' : '4px solid #2196F3',
            borderRadius: '4px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            zIndex: '9999',
            fontFamily: 'Arial, sans-serif',
            minWidth: '400px',
            maxWidth: '800px',
            fontSize: '16px',
        });
        popup.textContent = message;
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.opacity = '0';
            popup.style.transition = 'opacity 0.5s';
            setTimeout(() => popup.remove(), 500);
        }, 2000);
    }

    // ========== UI CREATION ==========
    function createButtonContainer() {
        const container = document.createElement('div');
        applyStyles(container, CONTAINER_STYLES);

        // Hide/show toggle
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = '▲';
        toggleBtn.style = 'position:absolute;right:8px;top:-28px;background:#444;color:#fff;border:none;border-radius:0 0 6px 6px;padding:4px 12px;cursor:pointer;z-index:10001;';
        let hidden = false;
        toggleBtn.onclick = () => {
            hidden = !hidden;
            container.style.transform = hidden ? 'translateY(100%)' : 'translateY(0)';
            toggleBtn.textContent = hidden ? '▼' : '▲';
        };
        container.appendChild(toggleBtn);

        // Buttons
        buttonActions.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.name;
            applyStyles(button, BUTTON_STYLES);

            button.onclick = () => {
                if (btn.actions.length === 1) {
                    handleButtonAction(btn.actions[0]);
                } else {
                    showSplitPopup(btn.actions, handleButtonAction);
                }
            };

            // Hover effect
            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = '#1976D2';
            });
            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = '#2196F3';
            });

            container.appendChild(button);
        });

        document.body.appendChild(container);
    }

    // ========== INIT ==========
    function init() {
        createButtonContainer();
        console.log('Enhanced WIMS Interface: Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();