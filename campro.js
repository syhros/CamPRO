// ==UserScript==
// @name         CamPRO - WIMS Enhancer
// @namespace    http://tampermonkey.net/
// @version      0.2.016.30
// @description  Streamlines WIMS case management with quick action buttons
// @author       camrees
// @match        https://optimus-internal-eu.amazon.com/*
// @grant        none
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/syhros/CamPRO/refs/heads/main/campro.js
// @downloadURL  https://raw.githubusercontent.com/syhros/CamPRO/refs/heads/main/campro.js
// ==/UserScript==

// 0.2.013 - Testing subject = `★ ${action.topic} ★`; for carrier raised cases
// 0.2.016 - Snooze button added
// 0.2.016.5 - Minor snooze button update
// 0.2.016.7- 0.2.016.19 - UI & Search Improvements & Original button removal
// 0.2.016.22 - Revered 0.2.016.20

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
        height: 'auto'
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
    // Mapping of every category, site and emails.
    // GLOBAL CONSTANTS
    // Mapping of attributes to sites
    const siteDictionary = {
        "UK": {
            "UK": {
                "Delivery Station": ["ALT1","DAB1","DBH3","DBI2","DBI3","DBI4","DBI5","DBI7","DBN2_UNIT 5","DBN2_UNIT 6", "DBN5",
                                    "DBR1","DBR2","DBR3","DBS2","DBS3","DBT3","DBT4","DCE1","DCF1","DCR1","DCR2","DCR3","DDD1",
                                    "DDN1","DEH1","DEX2","DHA1","DHA2","DHP1","DHU2","DHW1","DIG1","DIP1","DLS2","DLS4","DBN2",
                                    "DLU2","DME1","DME4","DNE2","DNE3","DNG1","DNG2","DNN1","DNR1","DOX2","DPE1","DPE2","DPN1","DPO1","DPR1",
                                    "DRG2","DRG3","DRH1","DRM2","DRM4","DRM5","DRR1","DSA1","DSA4","DSN1","DSO2","DSS2","DST1","DWN2",
                                    "DWR1","DWR2","DXE1","DXG1","DXG2","DXM2","DXM3","DXM4","DXM5","DXN1","DXP1","DXS1","DXW2","DXW3","HIG3","HUK3","HRM2 ", "HSA7",
                                    "UGL1","UKK1","ULI2","ULO1","ULO5","ULO6","ULS1","UMC3","UNW2","UPO1","USH2","UUK1","UUK2","UUK3A","UUK3B"],
                "3PL": ["ARRO-WORCESTE-GB","AUA4","EUKA - UNIT 10","EUKA - UNIT 9","EMSA","EUKB","EUKD","IUKM","SEKO","XUKO","XUKR","XUKA","XLP1","VECG","VEGI","VEMS","VEOD","VEPG","VEQP","VEBR"],
                "FC": ["BHX1","BHX10","BHX2","BHX3","BHX5","BHX7","BRS1","BRS2","CWL1","DHA3","DSA6","DSA7","DWN1","DWN1_Sublet","EDI4","EMA1",
                      "EMA2","EMA3","EMA4","HOX2","EUK1","EUK5","EUKA - UNIT 11","GLA1","GLO2","HEH1","HST1","HXM1","HXW3","IBA9","LBA1","LBA2","LBA3","LBA5",
                      "LCY1","LCY2","LCY3","LCY5","LHR8","LPL2","LTN1","LTN2","LTN4","LTN5","LTN7","MAN1","MAN2","MAN3","MAN4","MME1",
                      "MME2","NCL1","NCL2","NEH1","SLO1","UMC2","XBH7","CLS9","EMA4"],
                "Dropship": ["PILH"],
                "IXD": ["BHX4","LBA4","UKK2"],
                "Sort Center": ["BHX8","CBI9","CCE9","CHW9","CUK8","CUK9","HTN7","LBA8","LBA9","LCY8","MAN8","SBS2","SEH1","SNG1","STN7","STN8","SXW2","STN9","SXW9","LPL9","CBI8"],
                "Retail": ["ILC5","ILC6","ILC8","ILD1","ILD7","ILF3","ILF8","ILH1","ILH3","ILH4","ILH5","ILH6","ILH7","ILH8","ILK1","ILK5",
                          "ILK7","ILO2","ILO3","ILO4","ILO5","ILO6","ILO8","ILO9","ILP4","LHR90"],
                "Vendor Flex": ["PUKK","PUKM","VEBF","VECA","VECB","VECU","VEEA","VEEO","VEGJ","VEGM","VEKA","VEPD","VEEI","VELC","VEMO","VERW","VELM","VEAG"],
                "Return Center": ["XBH6","XBH8","XUKC"],
                "Commercial Carriers": ["Royal Mail"]
            },
            "IE": {
                "Delivery Station": ["DIS1","DIS2"],
                "FC": ["SNN4","SNN5"]
            }
        },
    };

    // Construct mapping of every site to its corresponding attributes
    let siteAttributes = {};
    for (const [region, countries] of Object.entries(siteDictionary)) {
        for (const [country, types] of Object.entries(countries)) {
            for (const [type, sites] of Object.entries(types)) {
                sites.forEach(site => {
                    siteAttributes[site] = { region, country, type };
                });
            }
        }
    };

    // Mapping of FC emails with escalations
    const fcEmailDictionary = {
        "ARRO-WORCESTE-GB":{
            'POC': 'networkcontrol@arrowxl.co.uk',
        },
    };

    // Mapping of every category code to its topics
    const categoriesDictionary = {
        "FRONTLINE": {
            "_____________________________ FRONTLINE _____________________________": {
            }
        },
        "EQUIPMENT": {
            "Equipment: Request from Carrier": {
                "Drop provided on time": {
                    "Carrier Informs Drop has been provided": [
                        "Paste Blurb",
                        "Hello Carrier,\n Please note that this case is not required and instead you can update the VRID comment/note as follows: \n\u00a0\nTrailer ID XXX dropped on ORIGIN SITE at 00:00 AM/PM on XX/XX/2025.\n",
                        {
                            status: "Resolved"
                        }
                    ]
                },
                "Drop provided on time and site rejected": {
                    "Carrier Informs Drop has been provided. Case raised +24hrs in advance to SAT and Rejected": [
                        "Paste Blurb ",
                        "Hello Carrier,\nPlease be informed that the trailer must be dropped only between 24 to 12 hours previous to SAT.\u00a0"
                    ],
                    "Carrier Informs Drop has been provided. Case raised 24hrs-12hrs in advance to SAT and Rejected": [
                        "Carrier should provide a photo or GPS proof before proceeding with below: \nUpdate the original VRID from DROP to DETACHED for the same carrier, anticipating the loading time by 30 minutes and updating the loading type to \u201cLive\u201d. \nLoop origin site and close the case. ",
                        "Hello Carrier,\nThe site won\u2019t be able to preload the trailer in advance. Please arrive with your own trailer. \nNew SAT:\nEquipment type: DETACHED_TRAILER"
                    ],
                    "Carrier Informs Drop has been provided. Case raised less than 12hrs to SAT and Rejected": [
                        "Update the original VRID from DROP to DETACHED for the same carrier, anticipating the loading time by 30 minutes and updating the loading type to \u201cLive\u201d. \nLoop origin site and close the case",
                        "Hello Carrier,\nThe trailer has not been dropped at least 12 hours in advance as per procedure and trailer cannot be preloaded as planned. For this reason, please arrive with your own trailer.\nPlease accept the new VRID with the below details:\n\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0 New SAT:\n\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0 Equipment type: DETACHED_TRAILER"
                    ]
                }
            }
        },
    };



    // Each button can have multiple actions (for popup), each with raisedBy, blurb, snooze, etc.
    const buttonActions = generateButtonActions(categoriesDictionary);

    /**
     * Flattens the categoriesDictionary into an array of button actions
     */
    function generateButtonActions(categoriesDictionary) {
        const actions = [];
        for (const [category, subcats] of Object.entries(categoriesDictionary)) {
           for (const [subcategory, topics] of Object.entries(subcats)) {
                const raisedBy = subcategory.toLowerCase().includes('site') ? 'Site'
                                : subcategory.toLowerCase().includes('carrier') ? 'Carrier'
                                : 'Other';
                const siteInput = raisedBy === 'Site';

                for (const [topic, blurbs] of Object.entries(topics)) {
                   for (const [blurbName, blurbData] of Object.entries(blurbs)) {
                        // Check if blurbData contains settings object as third element
                        const settings = blurbData[2] || {};

                        actions.push({
                            category,
                            subcategory,
                        topic,
                        blurbName,
                        sop: blurbData[0],
                        blurb: blurbData[1],
                        raisedBy,
                        siteInput,
                        // Add optional settings
                        snooze: settings.snooze || null,
                        status: settings.status || null
                    });
                }
            }
        }
    }
    return actions;
}

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
    function getFollowUpButton() {
        const addSubjectIframeDoc = getAddSubjectIframeDoc();

        return getElement(addSubjectIframeDoc, "//a[text()='Case Follow Up']");
    };

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

    // ========== MAIN BUTTON ACTION ==========
    async function handleButtonAction(action) {
        try {
            let subject = action.topic;
            if (action.siteInput) {
                // Prompt for site code
                const site = prompt("Enter site code (e.g. BHX1):");
                if (!site) return;
                subject = buildSubject(site.toUpperCase(), action.topic);
            } else {
                subject = `★ ${action.topic} ★`;
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
            const subjectInput = getAddSubject();
            if (subjectInput) setReactInputValue(subjectInput, subject);
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
            showPopup(`Applied: ${subject}`);
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
function searchActions(query) {
    if (!query) return [];

    const searchTerms = query.toLowerCase().trim().split(/\s+/);

    return buttonActions.filter(action => {
        const searchableText = [
            action.category,
            action.subcategory,
            action.topic,
            action.blurbName,
            action.sop,
            action.blurb
        ].map(text => (text || '').toLowerCase()).join(' ');

        return searchTerms.every(term => searchableText.includes(term));
    }).sort((a, b) => {
        // Sort by how many search terms match at the start of the text
        const aText = `${a.category} ${a.subcategory} ${a.topic} ${a.blurbName}`.toLowerCase();
        const bText = `${b.category} ${b.subcategory} ${b.topic} ${b.blurbName}`.toLowerCase();

        let aScore = 0;
        let bScore = 0;

        searchTerms.forEach(term => {
            if (aText.startsWith(term)) aScore++;
            if (bText.startsWith(term)) bScore++;
        });

        return bScore - aScore;
    });
}

function createButtonContainer() {
    // Create the main container
    const container = document.createElement('div');
    applyStyles(container, CONTAINER_STYLES);

    // Create snooze container
    const snoozeContainer = document.createElement('div');
    Object.assign(snoozeContainer.style, {
        display: 'flex',
        justifyContent: 'center',
        gap: '6px',
        marginBottom: '10px',
        paddingTop: '10px',
        paddingLeft: '10px'
    });

    // Add snooze buttons
    const snoozeButtons = [
        { label: '15', hours: 0.25 },
        { label: '30', hours: 0.5 },
        { label: '1h', hours: 1 },
        { label: '2h', hours: 2 },
        { label: '4h', hours: 4 },
        { label: '8h', hours: 8 }
    ];

    snoozeButtons.forEach(({ label, hours }) => {
    const button = document.createElement('button');
    button.textContent = label;
    button.title = `Sets to 'Reply follow up' and adds ${label} snooze time`;
    Object.assign(button.style, {
        padding: '4px',
        width: '30px',
        height: '30px',
        background: '#444',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    });
    button.onclick = async () => {
        // First click the reply box
        const replyToCase = getReplyToCase();
        if (replyToCase) {
            replyToCase.focus();
            await delay(300); // Wait for field to register click
        }

        // Then click the Follow Up button
        const followUpButton = getFollowUpButton();
        if (followUpButton) {
            followUpButton.click();
            await delay(300); // Wait for follow up time field to appear
        }

        // Finally set the follow up datetime
        const followUpDatetime = getFollowUpDatetime();
        if (followUpDatetime) {
            const date = new Date();
            date.setTime(date.getTime() + hours * 60 * 60 * 1000);
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            setReactInputValue(followUpDatetime, formattedDate);
        }
    };
    snoozeContainer.appendChild(button);

    // Create quick container
    const quickContainer = document.createElement('div');
    Object.assign(quickContainer.style, {
        display: 'flex',
        justifyContent: 'center',
        gap: '6px',
        marginBottom: '10px',
        paddingTop: '10px',
        paddingLeft: '10px'
    });

    // Add snooze buttons
    const quickButtons = [
        { label: 'Test',}
        ]

    quickContainer.appendChild(button);

    const container = document.createElement('div');
    applyStyles(container, CONTAINER_STYLES);
});

    // Add search box
    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.placeholder = 'Search categories, topics, blurbs...';
    Object.assign(searchBox.style, {
        width: '40%',
        minWidth: '25%',
        padding: '8px 12px',
        border: '1px solid #444',
        borderRadius: '4px',
        background: '#333',
        color: '#fff',
        marginLeft: 'auto',
        marginRight: 'auto',
        height: '36px',
        position: 'absolute',
        right : '20px'
    });

    // Create buttons container with horizontal scroll
    const buttonsContainer = document.createElement('div');
    Object.assign(buttonsContainer.style, {
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '4px',
        width: '40%',
        maxHeight: '160px',
        overflowY: 'auto',
        overflowX: 'hidden',
        marginTop: '-165px',
        position: 'absolute',
        right: '20px',
        bottom: '100%',
        background: '#1f1f1f',
        borderRadius: '4px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.3)'
    });

    // Update button styles to have minimum width
    const UPDATED_BUTTON_STYLES = {
        ...BUTTON_STYLES,
        width: '100%',
        flex: '0 0 auto',
        height: '40px',
        margin: '0px',
        padding: '8px 12px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textAlign: 'left'
    };

    // Search functionality (keep existing search event listener)
    searchBox.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        let searchTimeout;
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            buttonsContainer.innerHTML = '';

            if (query) {
                const results = searchActions(query);
                results.forEach(action => {
                    const button = document.createElement('button');
                    button.textContent = `${action.subcategory} > ${action.topic} > ${action.blurbName}`;
                    applyStyles(button, UPDATED_BUTTON_STYLES);
                    button.onclick = () => handleButtonAction(action);
                    buttonsContainer.appendChild(button);
                });
            }
        }, 300);
    });

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

    container.appendChild(snoozeContainer);
    container.appendChild(toggleBtn);
    container.appendChild(searchBox);
    container.appendChild(buttonsContainer);
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

// ========== SUBJECT BUILDER ==========
function buildSubject(site, topic) {
    const attr = siteAttributes[site] || {};
    if (attr.region === 'UK') {
        return `★ [${attr.country || ''}][${site}][${attr.type || ''}] ${topic} ★`;
    }
    return `★ [${attr.region || ''}][${attr.country || ''}][${site}][${attr.type || ''}] ${topic} ★`;
}

})();
