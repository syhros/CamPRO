// ==UserScript==
// @name         CamPRO - WIMS Enhancer
// @namespace    http://tampermonkey.net/
// @version      0.2.016.9
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
// 0.2.016.7- - UI Improvements

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
        "SEU": {
            "ES": {
                "FC": ["BCN1","BCN3","BCN4","DQB5","DQB9","DQV8","MAD4","MAD6","MAD7","MAD9","OQV7","ORI1","OVD1","RMU1","SES1","SES2","SVQ1","SVQ2","VLC1"],
                "IXD": ["BCN2","ZAZ1"],
                "Sort Center": ["BCN6","BCN8","MAD8","ZAZ8","ZZZ1"],
                "Delivery Station": ["DAS1","DCT1","DCT2","DCT4","DCT7","DCT9","DCZ3","DCZ4","DGA2","DGQ1","DIC1","DMA2","DMA3","DMA4","DMA6","DMA7","DMZ1",
                                    "DMZ2","DMZ4","DQA1","DQA2","DQA4","DQA7","DQA8","DQB2","DQB6","DQE2","DQL2","DQV1","DQV2","DQV6","DQZ5","DZG2","OCN2","OMD3","UES3","UES4","USV1",
                                    "UVL1","UZR1"],
                "3PL": ["BNCO-CORR-BARCELON-ES","DGP1","HBE7","MXPA","OCM2","PESG","VEBK","XMA4","XMA8","XIBA","XESF","XITI"],
                "Vendor Flex": ["OAO7","VAD4","VEAE","VEAK","VEBG","VECL","VEEG", "VEGE","VEHG","VEHV","VEHZ","VEKS","VEMC","VENG","VEOL","VEPX","VEPW","VELF","VEMU","VERH","VERZ","VETL","VETS","VEWO"],
                'Commercial Carriers': ["Correos","Correos Express","SEUR"]
            },
            "IT": {
                "FC": ["BGY1","BLQ1","FCO1","FCO2","FCO5","HER1","HLZ1","HPI7","HVN1","MXP3","MXP5","MXP6","PSR2","TRN1","TRN2","UIT7","VEIF"],
                "Sort Center": ["BLQ8","CIT9","FCO9","POD6","LIN8","MXP8","TRN3","TRN8","TRN9"],
                "Delivery Station": ["DER1","DER2","DER3","DER5","DFV1","DFV2","DLG1","DLJ4","DLO1","DLO2","DLO3","DLO4","DLO5","DLO7","DLO8","DLY1",
                                    "DLZ1","DLZ2","DLZ3","DLZ7","DMR1","DNP1","DPI2","DPI3","DPI4","DPI5","DPI6","DPU1","DRE1","DRU1","DSG1","DSI1",
                                    "DSI2","DTC1","DTC2","DTC3","DTC6","DTT1","DUM1","DVN1","DVN2","DVN3","DVN4","DVN5","DVN6","HME8","HLO2","OLZ3","ORE2","UBA1","UIT1","UIT4",
                                    "UTR1"],
                "3PL": ["HNP4","LIRF","MLDB","OSI5","OTC6","OTT2","VERX","XITC","XITF","XITG","XITK","BRT-LANDRIAN-IT","VEHQ","VEPU","VEEQ","POBS-POIT-BRESCIA-IT","POIT-BOLOGNA-IT "],
                "Vendor Flex": ["VEKV","VELH","VENK","VEON","VEPK","YMAD"]
            },
            "FR": {
                "FC": ["BVA1","CDG1","ETZ2","LIL1","LYS1","MRS1","ORY1","ORY4","OWL3"],
                "IXD": ["CDG7"],
                "Sort Center": ["CDG8","LIL8","LYS8","OIF6 ","OIF7","ORY8","MRS9"],
                "Delivery Station": ["CNC9","DAC2","DAO1","DAO2","DAO3","DAR1","DAR2","DAR9","DBF1","DIF1","DIF2","DIF3","DIF4","DIF5","DIF6","DLP2","DLP4","DLP5",
                                    "DNC1","DNC2","DNC3","DNC4","DND1","DND2","DPF2","DPF3","DPF3_CIVIL","DWB2","DWB9","DWL1","DWP1","DWP2","DWP7","DWV1","OAR2",
                                    "DRQ6","PARA","HLG4","HPI7"],
                "3PL": ["CFR9","COLIPOSTE_MOISSY_FR","HFR4","LPGE-LP-THILLAY-FR","ONC2","OWP5","MONDIAL_RELAY_SAINT_QUENTIN_FR","RELAISCOLIS_COMBS_FR","SAR1-CP-BREBIERE-FR","SHNN","SHIH","SHRT-CDG7-3","VEME","VEKL","XFRN","XCD1","XFRO","XFRE","XFRJ","XFRL","XFRO","XFRS","XFRZ","XOR4","XOS1"],
		        "Vendor Flex": ["VEBH","VEBQ","VEBJ","VEEM","VEWM","VEQG","VEPR","VEPY","VEPZ"],
		        "Return Center": ["XCR2","XOR7"],
                "Other": ["OWL6","OWL7","OWP9","VEBD","VECY","VEFN"],
                "Commercial Carriers": ["Chronopost","LA POSTE", "UPS"]
            }
        },
        "MEU": {
            "DE": {
                "FC": ["BER3","BER6","BRE1","BRE2","BRE4","CGN1","DRS4","DTM1","DTM3","DUS2","DUS4","EDEB","ERF1","FRA1","FRA3","FRA7",
                      "HAJ2","HAM2","HAM3","HBE1","HBE2","HBW1","HBW2","HBW5","HBY1","HHE1","HMU1","HNM1","HNM6","HNX4","HRP2","HSB1","HSN1",
                      "HTM3","HTR2","LEJ1","LEJ2","LEJ3","LEJ4","LEJ5","MUC3","MUC7","NUE1","PAD1","PAD2","RLG1","SCN2","STM3","STR1","STR2","STR5","VEHF"],
                "Sort Center": ["BER8","CGN9","CDE9","CGE9","DTM8","DTM9","FRAX","HAJ8","KSF7","LEJ7","MUC7","MUC9","NUE9","PDEQ","MHG9","HMU3","HNM5","HTR2","HH9N","SCN8","SDEV","SFPU"],
                "Delivery Station": ["DAH1","DAH2","DBB1","DBB3","DBD2","DBE1","DBE2","DBE3","DBE8","DBV1","DBW1","DBW3","DBW5","DBW6","DBW8","DBX8","DBY8",
                                    "DBX9","DBY1","DBY2","DBY3","DBY4","DBY5","DBY7","DBY8","DBZ4","DBZ6","DCB1","DFQ9","DHB1","DHB2","DHE1","DHE2","DHE3",
                                    "DHE4","DHE5","DHE6","DHE7","DHE8","DHF4","DHH1","DHH2","DHH3","DHH5","DMU1","DMU2","DMU3","DMU5","DMV1","DMV3",
                                    "DNI5","DNM1","DNM2","DNM4","DNM6","DNM7","DNM8","DNM9","DNW1","DNW2","DNW3","DNW4","DNW5","DNW6","DNW8","DNW9",
                                    "DNX1","DNX2","DNX3","DNX4","DNX5","DNX6","DNZ2","DNZ3","DRP1","DRP2","DRP3","DRP4","DRP5","DRP6","DRP9","DSH2",
                                    "DSH4","DSQ9","DSU1","DSY1","DSY2","DSY3","DSY6","DTH1","HBW3","UDE6","UHA1","UMU1"],
                "IXD": ["DTM2","HAJ1","XFR7"],
                "Airport": ["EDDP_BLDG","EDDP_LAND","EDDP","HAJA","LEJA"],
                "3PL": ["PDEM","XDEV","XDEA","XGEB","XDEQ","XDEO","XDEZ","XCG3","DHHB-LUDWIGSA-DE","DP30-DP-HANNOVER-DE","DP34-DP-STAUFENB-DE","DP17-DP-NEUSTREL-DE",
                        "DP15-DP-RUDERSDO-DE","DP04-DP-RADEFELD-DE","FWHAL","HDU1","SFIM","SFMB","SHST","STME","VEAD","VEIX ","VEJA","VEPC","VENC","VETK","VEVI","VEWD","VEEY" ,"XDE1","XFR1","XFR4","XPO1","XPLA"],
                "Vendor Flex": ["VEAH","VEBE","VECI","VEIR","VELQ","VEMF","VEOF","VEPB","VETT","VEWJ"],
		        "Return Center": ["XDT1"],
                "OTHERS" : ["VEFH","VEQF","VENJ","VEPP","VEQB","XDT3"]
            },
            "CZ": {
                "FC": ["BRQ2","PRG2","PRG5"],
                "Sort Center": ["PRG9"]
            },
            "SK": {
                "FC": ["BTS2"]
            },
            "AT": {
                "Delivery Station": ["DAP5","DAP8","DOQ8","DOQ9","DVI1","DVI2","DVI3","DZQ1"],
                "3PL": ["A627-DPDA-SULZ627-AT","HVX6"]
            },
            "BE": {
                "Delivery Station": ["DBG2","DHG1","DHG2","OBG3","OBG5"],
                "Sort Center": ["EBLG","OBG2","OBG7"],
                "3P": ["KELG"]
            },
            "NL": {
                "Delivery Station": ["DNL1"],
                "IXD": ["XAM1"],
                "OTHER": ["PNLD"]
            },
            "PL": {
                "FC": ["KTW1","KTW3","KTW4","KTW5","LCJ2","LCJ3","LCJ4","OSYW","POZ1","POZ2","SZZ1","WRO1","WRO2","WRO3","WRO4","WRO6"],
                "IXD": ["WRO5"],
                "3PL": ["XDR1","XPLC","XPLE","XWR3","XWR4","YWRO","RO62-DHPL-ROBAKOWO-PL"],
                "Vendor Flex": ["VECE","VEFE"]
            },
            "SE": {
                "3PL": ["XAR1"]
            },
            "TR": {
                "FC": ["IST2","XSA8"],
                "3PL": ["ARAS-ANKARA-TR","XTRA","XTRD"]
            }
        }
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
        "BCN1": {
            'Outbound Dock': 'bcn1-ship-managers@amazon.com',
            'Outbound Ops (L6 Escalation)': 'bcn1-outbound-ops@amazon.com',
            'Inbound Dock': 'bcn1-dock-manager@amazon.com',
            'Inbound Ops (L6 Escalation)': 'bcn1-inbound-ops@amazon.com',
            'TAM': 'adriarub@amazon.es',
            'TOM': 'BCN1-eu-tom-team@amazon.com ',
            'TOM leads': 'BCN1-eu-tom-team@amazon.com',
        },
        "BCN3": {
            'Master': 'guitart@amazon.es',
            'TOM Leads': 'bcn3-eu-tom-leads@amazon.com',
            'BCN3 OPS': 'bcn3-amxl-ops@amazon.com',
            'OB General': 'bcn3-ob-mgrs@amazon.com',
            'IB General': 'bcn3-ib-dock@amazon.com',
            'TAM': 'prefr@amazon.es',
            'TOM': 'BCN3-eu-tom-team@amazon.com'
        },
        "BCN4": {
            'TOM Team': 'bcn4-eu-tom-team@amazon.es',
            'Outbound Cases': 'bcn4-ship-cases@amazon.com',
            'Outbound Ops (L6 escalations)': 'bcn4-outbound-ops@amazon.com',
            'Outbound SOM (L7 escalations)': 'liartebl@amazon.com',
            'Inbound Ops (L6 Escalation)': 'Bcn4-Inbound-ops@amazon.com',
            'Inbound SOM (L7 Escalation)': 'casjordi@amazon.com',
            'Inbound cases': 'bcn4-dock-cases@amazon.com',
            'TAM': 'gmmelian@amazon.es',
            'TOM': 'bcn4-eu-tom-team@amazon.com'
        },
        "BCN6": {
            'General': 'bcn6-slt@amazon.com',
            'TOM Lead': 'gaig@amazon.com'
        },
        "BCN8": {
            'BCN8 Yard Marshall Team': 'bcn8-ym@amazon.com',
            'BCN8 TOM team': 'bcn8-eu-tom-team@amazon.com',
            'BCN8 Yard Escalation 2': 'guilfra@amazon.com',
            'BCN8 Dock Leadership': 'bcn8-dock-leadership@amazon.com',
            'BCN8 Dock Escalation 1': 'cxercavi@amazon.es',
            'BCN8 Dock Escalation 2': 'llegorbu@amazon.es',
            'BCN8 IB Leadership': 'bcn8-ib@amazon.com',
            'BCN8 IB Escalation 1': 'bcn8-ib-managers@amazon.com',
            'BCN8 IB Escalation 2': 'ferrfa@amazon.com',
            'TAM': 'andbaena@amazon.com',
            'TOM': 'BCN8-eu-tom-team@amazon.com'
        },
        "BGY1": {
            'TOM Team': 'bgy1-eu-tom-leads@amazon.com',
            'OB General': 'bgy1-ship-am@amazon.com',
            'BGY1 Dock Team': 'bgy1-ib-dock@amazon.com',
            'IB General': 'bgy1-ib-ops@amazon.com',
            'Dock to Dock': 'bgy1-dock-am@amazon.com',
            'VRET': 'bgy1-vendor-returns@amazon.com',
            'TAM': 'admascol@amazon.it',
            'TOM': 'BGY1-eu-tom-team@amazon.com'
        },
        "BHX2": {
            'Outbound': 'bhx2-cases@amazon.com',
            'Inbound': 'bhx2-cases@amazon.com',
            'IB Shipping': 'bhx2-shipping@amazon.com',
            'OB Dock': 'bhx2-ib-dock@amazon.com',
            'TOM': 'bhx2-cases@amazon.com',
            'TOM Lead': 'bhx2-eu-tom-leads@amazon.com'
        },
        "BHX3": {
            'Shipping': 'bhx3-shipping@amazon.com',
            'OB Dock': 'bhx3-ob-dock@amazon.com',
            'OB Lead': 'bhx3-ob-leads@amazon.com',
            'TOM':'bhx3-tom@amazon.com',
            'Vendor Returns': 'bhx3-vr@amazon.com',
            'IB Leads' : 'bhx3-ib-leads@amazon.com',
            'IB Team':'bhx3-inbound@amazon.com',
            'IB Dock':'bhx3-inbound-dock-managers@amazon.com',
            'Master' : 'andrnash@amazon.co.uk'
        },
        "BHX5": {
            'OB Team': 'bhx5-shipping@amazon.com',
            'Vendor Returns': 'bhx5-vendor-returns@amazon.com',
            'IB Dock': 'bhx5-inbound-dock@amazon.com',
            'TOM': 'bhx5-eu-tom-team@amazon.com',
            'TOM Leads': 'bhx5-eu-tom-leads@amazon.com',
            'Managers': 'bhx5-managers@amazon.com'
        },
        "BHX7": {
            'Outbound': 'bhx7-outbound@amazon.com',
            'Inbound': 'bhx7-inbound@amazon.com',
            'Bookings': 'bhx7-bookings@amazon.com',
            'TOM': 'bhx7-eu-tom-leads@amazon.com',
            'OB Managers': 'bhx7-ob-ops-managers@amazon.com',
            'IB Managers': 'bhx7-inbound-managers@amazon.com'
        },
        "BLQ1": {
            'Yard Leads': 'blq1-eu-tom-leads@amazon.com',
            'Yard General': 'blq1-eu-tom-team@amazon.com',
            'Ship Dock AMs': 'blq1-ship-managers@amazon.it',
            'OB Managers': 'blq1-outbound-manager@amazon.com',
            'OB Escalation': 'blq1-outbound-ops@amazon.com',
            'Dock Inbound AMs': 'blq1-dock-managers@amazon.it',
            'IB Escalation': 'blq1-ib-ops@amazon.com',
            'TAM': 'andmarob@amazon.it',
            'TOM': 'BLQ1-eu-tom-team@amazon.com ',
            'Manager 1': 'andmarob@amazon.it',
            'Manager 2': 'sperrino@amazon.it'
        },
        "BLQ8": {
            'Area Mangers': 'blq8-am@amazon.com',
            'Dock': 'blq8-dock@amazon.com',
            'OB General': 'blq8-ob@amazon.com',
            'OB Leads': 'blq8-lead@amazon.com',
            'Inbound': 'blq8-ib@amazon.com',
            'TAM': 'slapenna@amazon.it',
            'TOM': 'BLQ8-eu-tom-team@amazon.com'
        },
        "BNCO-CORR-BARCELON-ES": {
            'General': 'acisclo.martinez@correos.com',

        },
        "BVA1": {
            'Site Leader': 'bjosseli@amazon.fr',
            'Yard General': 'bva1-tom@amazon.com',
            'Snr Ops': 'masurel@amazon.fr',
            'Quentin Viot (Ops)': 'viotquen@amazon.fr',
            'Baptiste Caron (ops Night)': 'baptcaro@amazon.fr',
            'OB General': 'bva1-outbound-shipping@amazon.com',
            'OB Managers': 'bva1-outbound-manager@amazon.com',
            'Returns': 'bva1-vreturns@amazon.com',
            'Julien Flamant (Snr Ops)': 'jflamant@amazon.fr',
            'Erwan Salou (Ops)': 'essalou@amazon.fr',
            'J. Vanstraceele (AM Night)': 'vanstrac@amazon.fr',
            'IB General': 'bva1-inbound-manager@amazon.com',
            'IB Dock': 'bva1-dock-team@amazon.com',
            'Tiphaine Sipp (Ops)': 'tiphsipp@amazon.fr',
            'TOM': 'bva1-tom@amazon.com '
        },
        "BER8": {
            'TOM Leads': 'ber8-eu-tom-leads@amazon.com',
            'Ops General': 'ber8-cases@amazon.com',
            'Outbound General': 'ber8-outbound@amazon.com',
            'YARD': 'ber8-yard@amazon.com',
            'Inbound General': 'ber8-inbound@amazon.com'
        },
        "BRE2": {
            'Yard Team': 'bre2-eu-tom-leads@amazon.com',
            'Inbound General': 'bre2-inbound@amazon.com',
            'Inbound OPS': 'bre2-ib-ops@amazon.com',
            'BRE2 Dock Team': 'bre2-ib-dock@amazon.com'
        },
        "BRE4": {
            'TOM Team Leads': 'bre4-eu-tom-leads@amazon.com',
            'TOM Team - Group email': 'bre4-eu-tom-team@amazon.com',
            'Case management (clerks/leads)': 'bre4-shipping@amazon.com',
            'OB escalation (ship dock AM)': 'bre4-ob-ship-am@amazon.de',
            'OB SOM': 'jgodglue@amazon.de',
            'IB Case management': 'bre4-ib-dock@amazon.com',
            'IB escalation (IB dock AM)': 'bre4-ib-am@amazon.com',
            'IB SOM': 'cbbojar@amazon.de',
            'BRE2 Dock Team': 'bre2-ib-dock@amazon.com',
            'IB Dock SME': 'wittemw@amazon.de',
            'TAM': 'schedeni@amazon.de',
            'ROM': 'ycclaus@amazon.de',
            'VENDOR RETURNS': 'bre4-vret@amazon.com'
        },
        "BTS2": {
            'Yard Team': 'bts2-eu-tom-leads@amazon.com',
            'TOM Leads': 'matemiki@amazon.com',
            'Ship team': 'bts2-transship-ship-clerks@amazon.com',
            'Outbound (Vendor Returns)': 'bts2-vendor-returns-managers@amazon.com',
            'Inbound team': 'bts2-inbound-transshipment-team@amazon.com',
            'Dock team': 'bts2-transship-dock-clerks@amazon.com'
        },
        "BRQ2": {
            'TOM Team': 'brq2-eu-tom-team@amazon.com',
            'TOM Leads': 'brq2-eu-tom-leads@amazon.com',
            'Ops Managers': 'brq2-outboundops@amazon.com',
            'Outbound Managers': 'brq2-ship-managers@amazon.com',
            'Outbound General': 'brq2-shipping@amazon.com',
            'Outbound (Vendor Returns)': 'brq2-vreturnsall@amazon.com',
            'Inbound Managers': 'brq2-inboundops@amazon.com',
            'Inbound General': 'brq2-inbounddock@amazon.com',
            'Inbound Leads': 'brq2-inboundlead@amazon.com'
        },
        "BHX4": {
            'Inbound Managers': 'bhx4-inbound-areamanagers@amazon.com',
            'Outbound Managers': 'bhx4-ob-managers@amazon.com',
            'TOM Team': 'bhx4-eu-tom-managers@amazon.com',
            'TOM Leads': 'bhx4-eu-tom-leads@amazon.com',
            'Outbound Dock': 'bhx4-shipping@amazon.com',
            'Outbound Leads': 'bhx4-ob-leads@amazon.com',
            'Inbound Dock': 'bhx4-inbound-dock@amazon.com',
            'Inbound General': 'bhx4-inbound@amazon.com',
            'Inbound Leads': 'bhx4-inbound-leads@amazon.com'
        },
        "BHX8": {
            'BHX8 shipping': 'uk-ats-bhx8-shipping@amazon.com',
            'BHX8 Yard': 'bhx8-eu-tom-team@amazon.com',
            'Master 1': 'mahama@amazon.co.uk',
            'Master 2': 'Viksharm@amazon.com'
        },
        "BRS1": {
            'TOM LEADS': 'brs1-eu-tom-leads@amazon.com',
            'TOM': 'brs1-eu-tom-team@amazon.com',
            'OB Ship': 'brs1-shipping@amazon.com',
            'OB Ship Leads': 'brs1-shipping-leadership@amazon.com',
            'OB Leads': 'brs1-ob-leads@amazon.com',
            'IB Dock': 'brs1-inbound-dock@amazon.com',
            'IB Dock Managers': 'brs1-ibdock-mgrs@amazon.com',
            'IB Leads': 'brs1-inbound-leads@amazon.com'
        },
        "BRS2": {
            'Shipping': 'brs2-shipping@amazon.com',
            'OB Leads': 'brs2-ob-leads@amazon.com',
            'Manager': 'agborod@amazon.com',
            'IB': 'brs2-ib-dock@amazon.com',
            'IB Leads': 'brs2-ib-leads@amazon.com',
            'Vendor Returns': 'brs2-vendor-returns@amazon.com',
            'TOM Team': 'brs2-eu-tom-team@amazon.com',
            'TOM Leads': 'brs2-eu-tom-leads@amazon.com',
            'OB Managers':'brs2-ob-managers@amazon.com',
            'IB Managers': 'brs2-ib-managers@amazon.com'
        },
        "CDG7": {
            'CDG7 TOM': 'cdg7-eu-tom-team@amazon.com',
            'Shipping': 'cdg7-shipping@amazon.com',
            'Dock (inbound team)': 'cdg7-dock-team@amazon.com',
            'TAM': 'kaorafiq@amazon.fr',
            'TOM': 'CDG7-eu-tom-team@amazon.com'
        },
        "CDG8": {
            'All managers': 'cdg8-manager@amazon.com',
            'Shipping team': 'dg-shipping-ne-fr-cdg8@cevalogistics.com',
            'Team leader 3PL': 'dg-teamleader-ne-fr-cdg8@cevalogistics.com',
            'Area manager 3PL': 'dl-areamanager-ne-fr-cdg8@cevalogistics.com',
            'OPS 3PL': 'dl-rex-fr-cdg8@cevalogistics.com'
        },
        "CDE9": {
            'CDE9 operations': 'SHD-DE-KWH-01-Leistand@Cevalogistics.com',
            'CDE9 support': 'xdea-amxl-ops@amazon.com'
        },
        "CFR9": {
            'Amazon OPS': 'cfr9-ops@amazon.com',
            'Master': 'aswiam@amazon.fr',
            '3PL management': 'direction.wemea.st-quentin5@geodis.com',
            'Area manager 3PL': 'dl-areamanager-ne-fr-cdg8@cevalogistics.com',
            'Yard admin': 'xfrn-yard.wemea.st-quentin5@geodis.com'
        },
        "Chronopost":{
            'POC': 'dno.codec@chronopost.fr, case.management.amazon@chronopost.fr, lisa.dupont@chronopost.fr'
        },
        "CIT9": {
            'OB Ops': 'cit9-amxl-ops@amazon.com',
            'IB Ops' : 'cit9-amxl-ops@amazon.com',
            'POC 1': 'paolo.tiberino@geodis.com',
            'POC 2': 'sibilla.orsi@geodis.com',
            'POC 3': 'matteo.pizzamiglio@geodis.com'
        },
        "CNC9": {
            'POC': 'aguffroy@amazon.com'
        },
        "COLIPOSTE_MOISSY_FR": {
            'POC 1 ': 'milan.svilar@laposte.fr',
            'POC 2': 'natacha.remy@laposte.fr',
            'Master': 'clientamz.sincro@laposte.fr',
            'Inbound 1': 'David Perrier',
            'Inbound 2': 'agathe.raymond@laposte.fr'
        },
        "Correos": {
            'Main POCs': 'aaron.morera@correos.com, estefania.cayarga@correos.com, mireia.miguel@correos.com, andrea.quesada.romero@correos.com, lorena.jimenez@correos.com, coordinacion.operativa@correos.com',
            'CTA SANTIAGO DE COMPOSTELA': 'dolores.blanco@correos.com, jose.esteban@correos.com, uam_santiago.acoruna@correos.com',
            'CTA VALLADOLID': 'florencio.campano@correos.com, jose.esteban@correos.com, uam_pb.valladolid@correos.com',
            'CTA OVIEDO': 'oscar.iglesias@correos.com, jose.esteban@correos.com, uam_ccp.oviedo@correos.com',
            'CTA BILBAO': 'jose.manrique@correos.com, angel.aguilar@correos.com, uam_pb.bilbao@correos.com',
            'CTA VITORIA': 'basilio.fernandez@correos.com, angel.aguilar@correos.com, uam_ccp.vitoria@correos.com',
            'CTA ZARAGOZA': 'jesus.hernandez@correos.com angel.aguilar@correos.com, uam_pb.zaragoza@correos.com',
            'CLI BACELONA': 'rafael.roldan@correos.com, sergio.hernandez@correos.com uam_cli.barcelona@correos.com',
            'CTP GIRONA': 'jordi.barrios.chamorro@correos.com, sergio.hernandez@correos.com, uam_pb.girona@correos.com',
            'CTP LLEIDA': 'juan.pla@correos.com, sergio.hernandez@correos.com, uam_ccp.lleida@correos.com',
            'CTP TARRAGONA': 'jose.garcia.perez@correos.com, sergio.hernandez@correos.com, uam.tarragona@correos.com',
            'CAM 2 MADRID': 'javier.pulido@correos.com, juan.matamoros@correos.com, uam_cam2.madrid@correos.com',
            'CTA MADRID': 'teresa.fernandez@correos.com, juan.matamoros@correos.com, uam_cta.madrid@correos.com',
            'CTA MERIDA': 'maria.gomez@correos.com, juan.matamoros@correos.com, uam.merida@correos.com',
            'CTA ALICANTE': 'jose.martinez.torrella@correos.com, domingo.diaz@correos.com, uam_pb.alicante@correos.com',
            'CTA PALMA DE MALLORCA': 'oscar.sanchez.rodriguez@correos.com, domingo.diaz@correos.com, uam_pb.baleares@correos.com',
            'CTA VALENCIA': 'angel.castiblanques@correos.com, domingo.diaz@correos.com, uam_pb.valencia@correos.com',
            'CTA GRANADA': 'mario.ochoa@correos.com, francisco.sanchez.osuna@correos.com, uam_ccp.granada@correos.com',
            'CTA SEVILLA': 'carlos.uribe@correos.com, francisco.sanchez.osuna@correos.com, uam_pb.sevilla@correos.com',
            'CTA MALAGA': 'lourdes.gallero@correos.com, francisco.sanchez.osuna@correos.com, uam_pb.malaga@correos.com',
            'CTA LAS PALMAS': 'martin.santana@correos.com, jose.garcia.moreno@correos.com, uam_pb.laspalmas@correos.com',
            'CTA TENERIFE': 'sandra.carrancio@correos.com, jose.garcia.moreno@correos.com, uam_pb.tenerife@correos.com'
        },
        "Correos Express":{
            'BCN1': 'm-rodriguezperez@correosexpress.com, y-saezgarcia@correosexpress.com , cuentasestrategicas@correosexpress.com , cc24.7@correosexpress.com',
            'BCN8': 'm-rodriguezperez@correosexpress.com, y-saezgarcia@correosexpress.com , cuentasestrategicas@correosexpress.com , cc24.7@correosexpress.com',
            'SVQ1': 'cc24.7@correosexpress.com, j-lobogil@correosexpress.com, cuentasestrategicas@correosexpress.com',
            'XESC': 'cc24.7@correosexpress.com, tarragona.incidencias@correosexpress.com, cuentasestrategicas@correosexpress.com',
            'VLC1': 'n-garciamembrilla@correosexpress.com, cuentasestrategicas@correosexpress.com',
            'RMU1': 'jl-colladogarcia@correosexpress.com, j-gallegoalcantara@correosexpress.com, cuentasestrategicas@correosexpress.com',
            'MAD4': 'e-munozjimenez@correosexpress.com, b-vegamartin@correosexpress.com, a-fernandezaguado@correosexpress.com, cuentasestrategicas@correosexpress.com',
            'MAD6': 'e-munozjimenez@correosexpress.com, b-vegamartin@correosexpress.com, a-fernandezaguado@correosexpress.com, cuentasestrategicas@correosexpress.com',
            'MAD7': 'e-munozjimenez@correosexpress.com, b-vegamartin@correosexpress.com, a-fernandezaguado@correosexpress.com, cuentasestrategicas@correosexpress.com',
            'MAD8': 'e-munozjimenez@correosexpress.com, b-vegamartin@correosexpress.com, a-fernandezaguado@correosexpress.com, cuentasestrategicas@correosexpress.com',
            'MAD9': 'e-munozjimenez@correosexpress.com, b-vegamartin@correosexpress.com, a-fernandezaguado@correosexpress.com, cuentasestrategicas@correosexpress.com',
            'Escalations': 'a-lopezruiz@correosexpress.com , cuentasestrategicas@correosexpress.com'
        },
        "CUK8": {
            'OB':'XUKA_Outbound@dhl.com',
            'IB':'XUKA_Inbound@dhl.com',
            'Master 1':'hensomme@amazon.lu',
            'Master 2': 'Chris.Green@dhl.com',
            'Master 3': 'Richard.Roberts@dhl.com'
        },
        "CUK9": {
            'OB': 'DG-EU-UK-XUKS-OPS-OUTBOUND@cevalogistics.com',
            'IB': 'DG-NE-GB-XUKS.OPS.INBOUND@cevalogistics.com',
            'Escalations': 'DG-NE-GB-XUKS.SLT@cevalogistics.com',
            'Manager' : 'hensomme@amazon.lu',
            'Snr Ops Manager': 'calvert.lijfrock@cevalogistics.com',
            'AMZ SC Escalation': 'xuks-amxl-ops@amazon.com'
        },
        "CGE9": {
            'CGE9 cases': 'xgeb-cases.nece.aurach@geodis.com',
            'CGE9 support': 'xgeb-amxl-ops@amazon.com'
        },
        "CGN1": {
            'Case Management': 'bolkenb@amazon.de',
            'Unloading delays': 'cgn1-receive-dock-manager@amazon.com',
            'IB OM': 'cgn1-ibops@amazon.com',
            'OB OM': 'cgn1-obops@amazon.com'
        },
        "CGN9": {
            'CGN9 Logistics': 'cgn9-logistics@amazon.de',
            'CGN9 Manager': 'cgn9-manager@amazon.de',
            'Master': 'kvaltter@amazon.com'
        },
        "CWL1": {
            'OB Leads': 'cwl1-outboundleads@amazon.com',
            'OB Team' : 'cwl1-ob@amazon.com',
            'Shipping': 'cwl1-shipping@amazon.com',
            'Vendor Returns': 'cwl1-vendor-returns@amazon.com',
            'IB Leads': 'cwl1-ib-leads@amazon.com',
            'IB Leads 2': 'cwl1-inboundleads@amazon.com',
            'IB Operations' : 'cwl1-ibops@amazon.com',
            'TOM' : 'cwl1-eu-tom-team@amazon.com',
            'TOM Leads' : 'cwl1-eu-tom-leads@amazon.com',
            'Dock Managers' : 'cwl1-dock-mgmt@amazon.com',
            'Manager': 'lewmacd@amazon.co.uk'
        },
        "DAC2": {
            'General 1' :'dac2-managers@amazon.com',
            'General 2': 'dac2-supervisors@amazon.com'
        },
        "DAP5":{
            'Outbound': 'at-amzl-dap5-lateshift@amazon.com',
            'Inbound': 'at-amzl-dap5-nightshift@amazon.com',
            'Master': 'at-amzl-dap5-management@amazon.com'
        },
        "DAP8":{
            'OB': 'sbalkan@amazon.at',
            'Yard': 'crusswur@amazon.at'
        },
        "DAO2":{
            "OB Supervisors":"dao2-supervisors@amazon.com",
            'OB Managers': 'dao2-managers@amazon.com',
            'IB Supervisors': 'dao2-supervisors@amazon.com',
            'IB Managers': 'dao2-managers@amazon.com',
            'Master': 'thmarch@amazon.fr'
        },
        "DAO3": {
            'General 1' :'dao3-supervisors@amazon.com',
            'General 2': 'dao3-managers@amazon.com'
        },
        "DAR9":{
            'General': 'dar9-supervisors@amazon.com',
            'Managers': 'dar9-managers@amazon.com'
        },
        "DBB1": {
            'General' : 'dbb1-amzn-hrly@amazon.com',
            'ES ':'de-amzl-DBB1-earlyshift@amazon.com',
            'LS' : 'de-amzl-DBB1-lateshift@amazon.com',
            'NS' : 'de-amzl-DBB1-nightshift@amazon.com',
            'MASTER' : 'de-amzl-DBB1-management@amazon.com',
            'Manager POC' : 'mazurekz@amazon.de'
        },
        "DBH3": {
            'General': 'uk-amzl-dbh3@amazon.com',
            'Master': 'juliagom@amazon.com'
        },
        "DBI4":{
            'General I': 'dbi4-amzn-hrly@amazon.com',
            'General II': 'uk-amzl-dbi4@amazon.com',
            'Managers': 'uk-amzl-dbi4-managers@amazon.com'
        },
        "DBI5": {
            'General': 'dbi5-amzn-hrly@amazon.com',
            'General 2': 'uk-amzl-dbi5@amazon.com',
            'Managers': 'uk-amzl-dbi5-managers@amazon.com'
        },
        "DBI7":{
            'OB General 1': 'dbi7-amzn-hrly@amazon.com',
            'OB General 2' : 'uk-amzl-dbi7@amazon.com',
            'POC 1': 'rahasuli@amazon.com',
            'POC 2': 'khhroo@amazon.com',
            'Managers': 'dbi7-leadership@amazon.com'
        },
        "DBE1": {
            'Managers': 'de-amzl-dbe1-management@amazon.com',
            'Manager': 'nagaaron@amazon.de',
            'IB General': 'de-amzl-DBE1-orm@amazon.com',
            'IB Early Shift': 'de-amzl-DBE1-earlyshift@amazon.com',
            'IB Late Shift': 'de-amzl-DBE1-lateshift@amazon.com',
            'IB Night Shift': 'de-amzl-DBE1-nightshift@amazon.com'
        },
        "DBE3": {
            'OB POC 1' : 'vaschwar@amazon.com',
            'OB POC 2' : 'quiloren@amazon.com',
            'OB POC 3' : 'caroreis@amazon.com',
            'OB POC 4' : 'de-amzl-dbe3-orm@amazon.com',
            'IB ES' : 'de-amzl-dbe3-earlyshift@amazon.com',
            'IB NS' : 'de-amzl-dbe3-nightshift@amazon.com',
            'IB POC 1' : 'awwenige@amazon.com',
            'Managers' : 'de-amzl-dbe3-management@amazon.com',
            'Master 1': 'dvd@amazon.com',
            'Master 2' : 'weissmax@amazon.com'
        },
        "DCF1": {
            'General': 'uk-amzl-dcf1@amazon.com',
            'Managers' : 'uk-amzl-dcf1-managers@amazon.com',
            'Leadership' : 'uk-amzl-dcf1-leadership@amazon.com'
        },
        "DCR3":{
            'OB': 'uk-amzl-dcr3@amazon.com',
            'Master': 'dcr3management@amazon.com'
        },
        "DCT4": {
            'OB 1' : 'dgrcip@amazon.com',
            'OB 2' : 'agusmoce@amazon.com',
            'IB 1': 'amaial@amazon.com',
            'IB 2': 'jubrice@amazon.com',
            'Master 1': 'es-amzl-dct4-managers@amazon.com',
            'Master 2': 'robmatia@amazon.com'
        },
        "DCT7":{
            'OB': 'es-amzl-dct7@amazon.com',
            'IB': 'es-amzl-dct7@amazon.com',
            'POC 1': 'paupujo@amazon.com',
            'POC 2': 'zlexgon@amazon.com',
            'POC 3': 'andesmo@amazon.com'
        },
        "DCT9": {
            'General': 'es-amzl-dct9@amazon.com'
        },
        "DBE2":{
            'ORM': 'de-amzl-dbe2-orm@amazon.com',
            'Late Shift': 'de-amzl-dbe2-lateshift@amazon.com',
            'Managers': 'de-amzl-dbe2-management@amazon.com',
            'Master': 'jonkrieg@amazon.com'
        },
        "DBF1": {
            'General' : 'dbf1-managers@amazon.com'
        },
        "DBS3": {
            'General' : 'iosto@amazon.com'
        },
        "DBV1": {
            'IB' : 'de-amzl-dbv1-management@amazon.com',
            'Master' : 'de-amzl-dbv1-management@amazon.com',
            'Manager' : 'melrichb@amazon.com'
        },
        "DBY1": {
            'OB': 'dby1-amzn-hrly@amazon.com',
            'OB & IB POC 1': 'ondeo@amazon.com',
            'OB & IB POC 2': 'fkadri@amazon.com',
            'Managers': 'dby1-management@amazon.com'
        },
        "DBY2":{
            'OB': 'de-amzl-dby2-management@amazon.com',
            'IB Team' : 'de-amzl-dby2-management@amazon.com',
            'IB Late Shift' : 'dby2-lateshift@amazon.com',
            'IB Night Shift' : 'dby2-nightshift@amazon.com',
            'Management' : 'dby2-management@amazon.com',
            'Master POC': 'sgigliol@amazon.de'
        },
        "DBY3": {
            'Early Shift': 'de-amzl-DBY3-earlyshift@amazon.com',
            'Late Shift': 'de-amzl-DBY3-lateshift@amazon.com',
            'Night Shift': 'de-amzl-DBY3-nightshift@amazon.com',
            'IB Lead': 'iramizi@amazon.com',
            'Management Team': 'de-amzl-DBY3-management@amazon.com',
            'Manager 2': 'znora@amazon.com'
        },
        "DDD1": {
            'General': 'uk-amzl-ddd1@amazon.com'
        },
        "DGO1": {
            'General': 'es-amzl-dgq1@amazon.com',
            'Master': 'noguean@amazon.com'
        },
        "DHE1": {
            'IB Early': 'dhe1-earlyshift@amazon.com',
            'IB Late': 'dhe1-lateshift@amazon.com',
            'IB Night' : 'dhe1-nightshift@amazon.com',
            'Managers' : 'dhe1-management@amazon.com',
            'Master' : 'pfaeffle@amazon.de'
        },
        "DHE6": {
            'Master' : 'de-amzl-dhe6-management@amazon.com',
            'IB 1' : 'aldenata@amazon.de',
            'IB 2' : 'mlschatz@amazon.de',
            'IB 3' : 'nilsthur@amazon.de',
            'IB 4' : 'regsvenk@amazon.com'
        },
        "DHW1":{
            'General': 'uk-amzl-dhw1@amazon.com',
            'Managers': 'uk-amzl-dhw1-managers@amazon.com'
        },
        "DIG1": {
            "General": 'uk-amzl-dig1@amazon.com',
            'Managers': 'uk-amzl-dig1-managers@amazon.com'
        },
        "DLO1": {
            'OB & Master': 'it-amzl-dlo1-mgmt@amazon.com',
            'IB': 'it-amzl-dlo1@amazon.com'
        },
        "DLO7":{
            'General': 'it-amzl-dlo7@amazon.com'
        },
        "DLO8": {
            'General':'it-amzl-dlo8@amazon.com',
            'Master 1': 'atiago@amazon.it',
            'Master 2': 'longoil@amazon.it',
            'Master 3': 'borellam@amazon.it'
        },
        "DLZ2": {
            'OB': 'it-amzl-dlz2-mgmt@amazon.com',
            'Master': 'it-amzl-dlz2-mgmt@amazon.com',
            'IB': 'it-amzl-dlz2-mgmt@amazon.com'
        },
        "DLS2": {
            'General': 'uk-amzl-dls2@amazon.co.uk',
            'Managers': 'uk-amzl-dls2-managers@amazon.com'
        },
        "DLS4": {
            'OB' : 'uk-amzl-dls4@amazon.com',
            'Managers' : 'uk-dls4-managers@amazon.com'
        },
        "DMA6": {
            'General': 'es-amzl-dma6@amazon.com',
            'General AM': 'am-dma6@amazon.com',
            'Managers': 'es-amzl-dma6-escalation@amazon.com'
        },
        "DMZ2": {
            'General': 'dmz2-amzn-sal@amazon.com',
            'General Night Shift': 'es-amzl-nightteam-dmz2@amazon.com',
            'Managers Night Shift': 'es-amzl-nightmgrs-dmz2@amazon.com'
        },
        "DNC2": {
            'Master': 'mccoendo@amazon.com',
            'DNC2 managers': 'dnc2-managers@amazon.com'
        },
        "DNC3": {
            'OB General': 'dnc3-pm@amazon.com',
            'OB Manager': 'dnc3-ops-managers@amazon.com',
            'OB Night Shift': 'dnc3-night@amazon.com',
            'IB Managers': 'dnc3-managers@amazon.com'
        },
        "DND1": {
            'General': 'dnd1-managers@amazon.com'
        },
        "DNL1": {
            'IB': 'dnl1-case-interests@amazon.com',
            'Master' : 'nl-amzl-dnl1-management@amazon.com'
        },
        "DNN1": {
            'General': 'uk-amzl-dnn1@amazon.com'
        },
        "DNR1": {
            'General': 'uk-amzl-dnr1@amazon.com',
            'Master': 'uk-amzl-dnr1-managers@amazon.com'
        },
        "DNW2": {
            'OB 1': 'revgeny@amazon.com',
            'OB 2': 'amchacha@amazon.de',
            'OB 3' : 'isalesi@amazon.com',
            'IB 1': 'turguttt@amazon.com',
            'IB 2' :'jgospoda@amazon.de',
            'IB 3' : 'isalesi@amazon.com',
            'Managers' : 'de-amzl-dnw2-management@amazon.com'
        },
        "DNW8": {
            'OB': 'lookssl@amazo.com',
            'OB Managers': 'de-amzl-DNW8-case-interests@amazon.com',
            'IB': 'appodbic@amazon.com',
            'IB Managers': 'de-amzl-DNW8-case-interests@amazon.com',
            'Managament': 'de-amzl-DNW8-management@amazon.com'
        },
        "DNX1":{
            'General': 'de-amzl-dnx1-inbound@amazon.com'
        },
        "DNX5": {
            'OB': 'de-amzl-dnx5-management@amazon.com',
            'IB Early Shift': 'de-amzl-dnx5-earlyshift@amazon.com',
            'IB Late Shift': 'de-amzl-dnx5-lateshift@amazon.com',
            'Night Shift': 'de-amzl-dnx5-nightshift@amazon.com',
            'Management': 'de-amzl-dnx5-management@amazon.com'
        },
        "DNZ2":{
            'Management': 'de-amzl-dnz2-management@amazon.com',
            'Manager': 'janickho@amazon.com',
            'Outbound': 'de-amzl-dnz2-lateshift@amazon.com',
            'Inbound': 'de-amzl-dnz2-nightshift@amazon.com'
        },
        "DOX2": {
            'General': 'uk-amzl-dox2@amazon.co.uk',
            'Master' : 'uk-amzl-dox2-managers@amazon.com'
        },
        "DPI2 ": {
            'General': 'it-amzl-dpi2-mgmt@amazon.com'
        },
        "DQA1": {
            'POC': 'ebbarque@amazon.com'
        },
        "DQA2": {
            'General': 'es-amzl-dqa2managers@amazon.com',
            'Manager 1': 'mppozo@amazon.es',
            'Manager 2': 'mbrmud@amazon.es',
            'Manager 3': 'rommunoz@amazon.com'
        },
        "DQA3":{
            'Operations': 'es-amzl-dqa3@amazon.com',
            'Escalations': 'amzl-escalation-es-dqa3@amazon.com'
        },
        "DQA4": {
            'DQA4 team': 'es-amzl-dqa4@amazon.com'
        },
        "DQA7": {
            'General': 'es-amzl-dqa7@amazon.com',
            'Managers': 'dqa7-managers@amazon.com'
        },
        "DQB5": {
            'Master': 'es-amzl-dqb5@amazon.com'
        },
        "DQB6": {
            'Inbound': 'es-amzl-dqb6@amazon.com',
            'Master': 'dqb6@vayvengroup.com'
        },
        "DQB9": {
            'Master': 'dgonzalez@delcom.es',
            'General': 'es-amzl-dqb9@amazon.com'
        },
        "DQE2": {
            'General': 'es-amzl-dqe2@amazon.com',
            'POC 1' : 'gcalva@citylogin.com'
        },
        "DQL2": {
            'General' : 'es-amzl-dql2@amazon.com',
            'DSM' : 'nlgarcia@amazon.com',
            'AM Master' : 'inavalv@amazon.es',
            'PM Master' : 'rglcjudi@amazon.es',
            'NS Master' : 'hperena@amazon.com'
        },
        "DQV8": {
            'General': 'es-amzl-dqv8@amazon.com'
        },
        "DSA1": {
            'General': 'uk-amzl-dsa1@amazon.com',
            'Managers': 'uk-amzl-dsa1-managers@amazon.com'
        },
        "DSA6": {
            'Ship Dock': 'dsa6-shipping@amazon.com',
            'Vendor Returns': 'dsa6-vret@amazon.com',
            'Dock Team': 'dsa6-ib-dock@amazon.com',
            'IB Team Leads': 'dsa6-ib-leads@amazon.com',
            'TOM Team': 'dsa6-eu-tom-team@amazon.com',
            'TOM Leads': 'dsa6-eu-tom-leads@amazon.com',
            'Managers': 'dsa6-managers@amazon.com'
        },
        "DSA7": {
            'Master': 'dsa7-managers@amazon.com',
            'Yard': 'isshei@amazon.com',
            'TOM Leads': 'dsa7-eu-tom-leads@amazon.com',
            'Operations': 'dsa7-managers@amazon.com'
        },
        "DSN1": {
            'General': 'uk-amzl-dsn1@amazon.com',
            'Managers': 'uk-amzl-dsn1-managers@amazon.com'
        },
        "DSU1":{
            "General POC": 'leibjona@amazon.com',
            'Managers': 'de-amzl-dsu1-management@amazon.com',
            'Master': 'mdansok@amazon.com'
        },
        "DSY2": {
            'OB POC1': 'muelgeor@amazon.de',
            'OB POC 2': 'klusaski@amazon.de',
            'IB General': 'dsy2-case-interests@amazon.com',
            'IB POC 1': 'muelgeor@amazon.com',
            'Managers' : 'de-amzl-dsy2-management@amazon.com',
            'Henry Boernicke' : 'hboernic@amazon.com'
        },
        "DTC2": {
            'General': 'it-amzl-dtc2@amazon.com',
            'Managers': 'it-amzl-dtc2-mgmt@amazon.com'
        },
        "DTH1 ": {
            'Outbound': 'dth1-case-interests@amazon.com',
            'OB 2' : 'buggluk@amazon.com',
            'IB' : 'buggluk@amazon.com',
            'Managers' : 'de-amzl-dth1-management@amazon.com'
        },
        "DUS2": {
            'OB Cases': 'dus2-truckmanager@amazon.de',
            'OB Ops': 'dus2-ob-opsmgmt@amazon.com',
            'OB ESCALATION': 'dus2-ship-manager@amazon.com',
            'IB ESCALATION': 'dus2-inbound-manager@amazon.com',
            'IB Ops': 'dus2-inbound-ops@amazon.com',
            'ULD Delays': 'dus2-inbound-receive@amazon.com',
            'TOM': 'zsolarov@amazon.com'
        },
        "DWB9": {
            'Site POC - Eline Vidal': 'eline.vidal@ctlog-international.com'
        },
        "DWL1 ": {
            'Outbound': 'dwl1-managers@amazon.com',
            'Master': 'mazars@amazon.fr'
        },
        "DWP2":{
            "General": 'dwp2-managers@amazon.com',
            'POC 1' : 'nacerb@amazon.com',
            'POC 2' : 'Sourourf@amazon.com'
        },
        "DWP7": {
            'General': 'dwp7-managers@amazon.com'
        },
        "DWV1": {
            'Cases': 'dwv1-case-interests@amazon.com',
            'Managers': 'dwv1-managers@amazon.com',
            'Supervisors': 'dwv1-supervisors@amazon.com'
        },
        "DXE1": {
            'Master' : 'amzl-uk-dxe1-managers@amazon.com'
        },
        "DXN1": {
            'IB' : 'uk-amzl-dxn1@amazon.co.uk',
            'Managers': 'amzl-uk-dxn1-managers@amazon.com',
            'Escalations': 'uk-amzl-dxn1-customerescalation@amazon.com'
        },
        "DXP1": {
            'OB' : 'uk-amzl-dxp1@amazon.com'
        },
        "DXG1": {
            'IB': 'uk-amzl-dxg1@amazon.com',
            'Master': 'uk-amzl-dxg1-customerescalation@amazon.com'
        },
        "DXG2":{
            'Yard': 'uk-amzl-dxg2@amazon.com'
        },
        "DXW3":{
            'General' : 'tylersea@amazon.co.uk',
            'Master' : 'dxw3-dispatch@amazon.com'
        },
        "DTM2": {
            'TOM Team': 'dtm2-3-eu-tom-team@amazon.com',
            'Outbound General': 'dtm2-shipping@amazon.com',
            'Outbound Managers': 'dtm2-outbound-manager@amazon.com',
            'Inbound General': 'dtm2-inbound@amazon.com',
            'Inbound Managers': 'dtm2-inbound-case@amazon.com'
        },
        "DTM8": {
            'POC 1': 'evelynce@amazon.com',
            'Master POC': 'evelynce@amazon.com',
            'DTM8 Shipping': 'dtm8-shipping@amazon.com',
            'Early Shift': 'Jonipete@amazon.com',
            'Late Shift': 'Tanjc@amazon.com',
            'Night Shift': 'hadahmad@amazon.com'
        },
        "DTM9": {
            'Manager DTM9 (IB, OB)': 'dtm9-manager@amazon.com',
            'Master POC': 'nfm-ats-de@amazon.com'
        },
        "DBG2": {
            'Manager': 'dbg2-managers@amazon.com'
        },
        "DFQ7":{
            'Management': 'dfq7-management@amazon.com'
        },
        "DFQ9": {
            'Master': 'marcfeit@amazon.com',
            'General': 'dfq9-interest@amazon.com'
        },
        "DHG1": {
            'Inbound' : 'dhg1-managers@amazon.com',
            'Managers' : 'dhg1-managers@amazon.com'
        },
        "DHG2": {
            'DHG2 managers': 'dhg2-managers@amazon.com',
            'Master': 'remue@amazon.com'
        },
        "DIF3": {
            'General':'dif3-managers@amazon.com',
            'Cases' : 'dif3-case-interests@amazon.com',
            'Supervisors' : 'dif3-supervisors@amazon.com',
            'IB POC 1' : 'yansylla@amazon.com',
            'IB POC 2' : 'pbbugiel@amazon.com',
            'IB POC 1' : 'yachajar@amazon.fr',
            'Master 2' : 'tohmc@amazon.fr'
        },
        "DIF4": {
            'General': 'dif4-managers@amazon.com',
            'Master' : 'chamob@amazon.com'
        },
        "DIF6": {
            'General':'dif6-supervisors@amazon.com',
            'Managers': 'dif6-supervisors@amazon.com',
            'Master': 'bgguyon@amazon.com',
            'IB POC1': 'ryoann@amazon.com',
            'IB POC2': 'cbreton@amazon.com'
        },
        "DIP1":{
            'General': 'uk-amzl-dip1@amazon.com',
            'Shift Managers': 'uk-amzl-dip1-shiftmanagers@amazon.com',
            'Supervisors': 'uk-amzl-dip1-supervisors@amazon.com',
            'Managers': 'uk-amzl-dip1-managers@amazon.com'
        },
        "DBW1": {
            'DBW1 Team': 'de-amzl-dbw1-management@amazon.com',
            'DBW1 NS Team': 'de-amzl-dbw1-nightshift@amazon.com'
        },
        "DBW3":{
            'General': 'muzzi@amazon.de',
            'Night Shift': 'de-amzl-dbw3-nightshift@amazon.de',
            'Management': 'de-amzl-dbw3-management@amazon.com'
        },
        "DBW5": {
            'OB' : 'dbw5-amzn-hrly@amazon.com',
            'IB': 'dlatifaj@amazon.de',
            'Managers': 'de-amzl-dbw5-management@amazon.com',
            'Master 1' : 'ottphili@amazon.com',
            'Master 2' : 'alexcz@amazon.com'
        },
        "DBW8": {
            'General' : 'dbw8-amzn-hrly@amazon.com',
            'OB POC' : 'sciarap@amazon.com',
            'IB POC 1': 'prasborg@amazon.com',
            'IB POC 2': 'leoschm@amazon.de',
            'IB POC 3': 'geghebre@amazon.de',
            'Managers' : 'dbw8-management@amazon.com',
            'Master' : 'kngsn@amazon.de'
        },
        "DBY8":{
            'Early Shift': 'de-amzl-dby8-earlyshift@amazon.com',
            'Late Shift': 'de-amzl-dby8-lateshift@amazon.com',
            'Night Shift': 'de-amzl-dby8-nightshift@amazon.com',
            'Managers': 'de-amzl-DBY8-management@amazon.com'
        },
        "DCT1": {
            'OB': 'es-amzl-dct1@amazon.es',
            'IB Day' : 'aidamart@amazon.com',
            'IB Night 1' : 'micoigna@amazon.com',
            'IB Night 2' : 'micoigna@amazon.com',
            'Master' : 'cemarc@amazon.com'
        },
        "DGP1":{
            'General': 'es-amzl-dgp1@amazon.com',
            'Master': 'joseluis.rodriguez@method-logistics.com'
        },
        "DOQ8": {
            'General': 'doq8-case-interests@amazon.com',
            'Master POC': 'fatihnup@amazon.com',
            'IB POC': 'ogueltep@amazon.com',
            'OB POC': 'ogueltep@amazon.com'
        },
        "DOQ9": {
            'General': 'doq9-case-interests@amazon.com',
            'Master POC': 'domomich@amazon.com'
        },
        "DER1": {
            'Operations' : 'der1-mgmt-amzl-it@amazon.com',
            'Master' : 'it-amzl-der1-mgmt@amazon.com'
        },
        "DER5": {
            'Managers': 'it-amzl-der5-mgmt@amazon.com',
            'Ops General': 'it-amzl-der5@amazon.com'
        },
        "DQV2": {
            'OB' : 'es-amzl-dqv2@amazon.com'
        },
        "DLP2":{
            'Operations': 'dlp2-managers@amazon.com',
            'Master POC': 'ylaurens@amazon.com'
        },
        "DMU2": {
            'OB' : 'dutsch@amazon.com',
            'IB' : 'kuffna@amazon.com',
            'Managers' : 'de-amzl-dmu2-management@amazon.com'
        },
        'DMV1':{
            'OB': 'de-amzl-dmv1-truckmanagement@amazon.com',
            'Master POC': 'verastz@amazon.com',
            'Managers': 'de-amzl-dmv1-truckmanagement@amazon.com'
        },
        "DNG1": {
            'OB' : 'uk-amzl-dng1@amazon.com',
            'IB' : 'uk-amzl-transport@amazon.com',
            'Master' : 'uk-amzl-dng1-leadership@amazon.com'
        },
        "DNE2": {
            'OB' : 'uk-amzl-dne2@amazon.com',
            'Master' : 'aaken@amazon.com',
            'Managers' : 'dne2-leadership@amazon.com'
        },
        "DNM2": {
            'OB': 'gabricpl@amazon.de',
            'IB': 'tmussehl@amazon.com',
            'Managers': 'de-amzl-DNM2-management@amazon.com',
            'Master': 'benniklh@amazon.com'
        },
        "DNM6": {
            'OB & IB': 'de-amzl-dnm6@amazon.com',
            'POC' : 'thoku@amazon.com',
            'Management': 'de-amzl-dnm6-management@amazon.com',
            'Master' : 'kleimusc@amazon.com'
        },
        "DNM8": {
            'OB' : 'falahs@amazon.de',
            'IB' : 'shelans@amazon.de',
            'Managers' : 'de-amzl-dnm8@amazon.de'
        },
        "DNP1": {
            'OB 1' :'it-amzl-dnp1-mgmt@amazon.com',
            'OB 2': 'moligaet@amazon.it',
            'IB 1' : 'it-amzl-dnp1-mgmt@amazon.com',
            'IB 2' : 'moligaet@amazon.it',
            'Master': 'quaglp@amazon.it'
        },
        "DNX2": {
            'Managers': 'dnx2-management@amazon.com',
            'NS Shift Manager': 'czernyac@amazon.com',
            'NS Area Manager': 'domagtim@amazon.com',
            'Night Shift General': 'dnx2-nightshift@amazon.com'
        },
        "DNX3": {
            'Early Shift': 'dnx3-earlyshift@amazon.com',
            'POC ES' : 'robtomic@amazon.com',
            'Late Shift' : 'dnx3-lateshift@amazon.com',
            'POC LS' : 'knietsch@amazon.de',
            'Escalation': 'stevpeta@amazon.com',
            'POC Night Shift' : 'akpalani@amazon.de',
            'Management' : 'dnx3-management@amazon.com',
            'DSM Maik Riefenstein' : 'maikrief@amazon.de'
        },
        "DNW3": {
            'Cases' : 'dnw3-case-interests@amazon.com'
        },
        "DNW6": {
            'Early Shift IB': 'de-amzl-dnw6-earlyshift@amazon.com',
            'Night Shift IB': 'de-amzl-dnw6-nightshift@amazon.com',
            'Lateshift OB': 'de-amzl-dnw6-lateshift@amazon.com',
            'ORM OB': 'de-amzl-dnw6-orm@amazon.com',
            'Management': 'de-amzl-dnw6-management@amazon.com'
        },
        "DNW9": {
            'Cases' : 'dnw9-case-interests@amazon.com',
            'OB POC' : 'carvrga@amazon.de',
            'IB POC 1': 'neimacdo@amazon.de',
            'IB POC 2' : 'ferrgiul@amazon.de',
            'Managers' : 'de-amzl-dnw9-management@amazon.com'
        },
        "DPO1": {
            'General' : 'uk-amzl-dpo1@amazon.com',
            'Dominik' : 'domorez@amazon.co.uk',
            'Managers': 'uk-amzl-dpo1-managers@amazon.com'
        },
        "DUS4": {
            'DUS4 SenOps': 'dus4-senops@amazon.de',
            'Outbound SOM': 'hakker@amazon.com',
            'Inbound SOM': 'schmitzc@amazon.com',
            'TOM Leads': 'dus4-tom-leads@amazon.com',
            'TOM Leads 2': 'dus4-eu-tom-team@amazon.com',
            'Outbound General': 'dus4-ob-ship-cases@amazon.com',
            'Outbound (Vendor Returns)': 'dus4-vreturn@amazon.com',
            'Case escalation group': 'dus4-dock-team@amazon.com',
            'Escalation Group': 'dus4-dock-manager@amazon.com'
        },
        "DTM1": {
            'TOM Leads': 'dtm1-gs-only@amazon.com',
            'ATSOutbound': 'dtm1-shipdock@amazon.com',
            'ATSWarehouseTransfer': 'dtm1-ixd@amazon.com',
            'Outbound (Vendor Returns)': 'dtm1-vreturn@amazon.com',
            'Inbound General': 'dtm1-dock-team@amazon.com',
            'Inbound Managers': 'dtm1-inbound-manager@amazon.com',
            'Inbound Ops': 'dtm1-inbound-ops@amazon.com',
            'Unloading Delays': 'dtm1-dockreceive-leaders@amazon.com',
            'Unloading Delays Escalation': 'dtm1-inbound-manager@amazon.com'
        },
        "DTM3": {
            'DTM3 Area': 'dtm3-area@amazon.com',
            'VENDOR RETURNS': 'dtm3-relo-manager@amazon.com',
            'Yard Issues': 'dtm2-3-eu-tom-team@amazon.com'
        },
        "DHA1": {
            'Managers': 'dha1-managers@amazon.com',
            'Ops General': 'uk-amzl-dha1@amazon.com',
            'Outbound SOM 1': 'dariches@amazon.co.uk',
            'Outbound SOM 2': 'aisss@amazon.co.uk'
        },
        "DHHB-LUDWIGSA-DE": {
            'Master': 'DHL-2MH-Disposition@dhl.com',
            'POC 1': 'christin.sessler@dhl.com',
            'POC 2': 'cd.ludwigsau@dhl.com'
        },
        "DME4": {
            'Contact': 'uk-amzl-dme4@amazon.com'
        },
        "DMZ4":{
            'General': 'es-amzl-dmz4@amazon.com',
            'Managers': 'es-amzl-managers-dmz4@amazon.es'
        },
        "DNW4": {
            'OB': 'de-amzl-DNW4-inbound@amazon.com',
            'IB': 'de-amzl-DNW4-inbound@amazon.com',
            'POC 1': 'omarfuen@amazon.com',
            'POC 2': 'jbblase@amazon.de'
        },
        "DRH1": {
            'General': 'uk-amzl-drh1@amazon.com',
            'General 2': 'uk-amzl-drh1@amazon.co.uk	',
            'Master': 'uk-amzl-drh1-leadership@amazon.com',
            'Manager 1': 'hikec@amazon.co.uk',
            'Manager 2': 'abdulrh@amazon.co.uk'
        },
        "DRP2":{
            'General': 'drp2-case-interests@amazon.com',
            'Managers': 'de-amzl-drp2-management@amazon.com',
            'Master POC': 'philipps@amazon.de'
        },
        "DRP4": {
            'Managers': 'de-amzl-drp4-management@amazon.com',
            'OB': 'de-amzl-DRP4-lateshift@amazon.com',
            'General': 'drp4-case-interests@amazon.com',
            'IB': 'de-amzl-DRP4-nightshift@amazon.com',
            'IB POC': 'behave@amazon.com'
        },
        "DRM5": {
            'OB' : 'uk-amzl-drm5@amazon.com',
            'Managers' : 'uk-amzl-drm5-escalations@amazon.com'
        },
        "DSQ9": {
            'General': 'dsq9-case-interests@amazon.com',
            'Master' : 'kohlm@amazon.com'
        },
        "DST1":{
            'Managers': 'dst1-managers@amazon.com',
            'OB/IB': 'uk-amzl-dst1@amazon.com'
        },
        "DVI1": {
            'OB LS' : 'at-amzl-dvi1-lateshift@amazon.com',
            'OB NS' : 'at-amzl-dvi1-nightshift@amazon.com',
            'IB ES' : 'at-amzl-dvi1-lateshift@amazon.com',
            'IB LS' : 'at-amzl-dvi1-lateshift@amazon.com',
            'IB NS' : 'at-amzl-dvi1-nightshift@amazon.com',
            'OB & IB Management' : 'at-amzl-dvi1-management@amazon.com',
            'Master 1': 'vssannik@amazon.at',
            'Master 2': 'flobrezi@amazon.de'
        },
        "DVI3":{
            'General': 'dvi3-case-interests@amazon.com',
            'OB': 'carildan@amazon.at',
            'IB': 'janinele@amazon.at',
            'Managers': 'at-amzl-dvi3-management@amazon.at'
        },
        "DVN3": {
            'OB' : 'it-amzl-dvn3@amazon.com',
            'IB' : 'it-amzl-dvn3@amazon.com',
            'Managment' : 'it-amzl-dvn3-mgmt@amazon.com'
        },
        "DWP1": {
            'Ops Managers': 'dwp1-managers@amazon.com'
        },
        "DWR1": {
            'OB': 'uk-amzl-dwr1@amazon.com',
            'Managers': 'uk-amzl-dwr1managers@amazon.com'
        },
        "DXM3": {
            'Master': 'uk-dxm3-managers@amazon.com',
            'IB': 'uk-amzl-dxm3@amazon.com'
        },
        "DXM4": {
            'General': 'uk-amzl-dxm4@amazon.com',
            'Managers' : 'uk-amzl-dxm4-leadership@amazon.com'
        },
        "DXS1": {
            'OB' : 'uk-amzl-dxs1@amazon.com',
            'Managers' : 'uk-amzl-dxs1-managers@amazon.com'
        },
        "DZG2":{
            'OB' : 'es-amzl-dzg2@amazon.com	',
            'Managers' : 'mgrs-es-amzl-dzg2@amazon.com	'
        },
        "EDI4":{
            'Shipping': 'edi4-shipping@amazon.com',
            'OB Leads': 'edi4-outboundleads@amazon.com',
            'RELO Bookings': 'dunfermlinebookings@amazon.co.uk',
            'IB Dock': 'edi4-inbounddock@amazon.com',
            'IB Managers': 'edi4-inboundmanagers@amazon.co.uk',
            'Vendor Returns': 'edi4-vendor-returns@amazon.com',
            'TOM Team': 'edi4-eu-tom-team@amazon.com',
            'TOM Leads': 'edi4-eu-tom-leads@amazon.com'
        },
        "EMA1": {
            'TOM Team': 'ema1-eu-tom-team@amazon.com',
            'TOM Leads': 'ema1-eu-tom-leads@amazon.com',
            'Outbound General': 'EMA1-shipping@amazon.com',
            'Outbound Leads': 'ema1-ob-leads@amazon.com',
            'Outbound (Vendor Returns)': 'ema1-vret@amazon.com',
            'Inbound Dock': 'ema1-ib-dock@amazon.com',
            'Inbound Managers': 'ema1-ib-managers@amazon.com',
            'Inbound Leads': 'ema1-ib-leads@amazon.com',
            'Inbound General': 'ema1-dockclerk@amazon.com'
        },
        "EMA3": {
            'Cases' : 'ema3-cases@amazon.com',
            'OB Leads': 'ema3-ob-leads@amazon.com',
            'IB Dock' : 'ema3-bookings@amazon.com',
            'IB Leads' : 'ema3-ib-leads@amazon.com',
            'CASES': 'ema3-cases@amazon.com',
            'TOM': 'ema3-eu-tom-team@amazon.com',
            'OB Managers': 'ema3-ob-managers@amazon.com',
            'IB Managers': 'ema3-ib-managers@amazon.com',
            'NS Managers' : 'ema3-ob-ns-managers@amazon.com'
        },
        "EMA4": {
            'All Managers': 'ema4-managers@amazon.com',
            'Outbound General': 'ema4-shipping@amazon.com',
            'TOM Team': 'ema4-eu-tom-team@amazon.com'
        },
        "EMSA": {
            'Amazon OPS': 'amazonops@haegroup.com',
            'General': 'dispatch@haegroup.com'
        },
        "EMA2": {
            'Master': 'ema2-shipping@amazon.com',
            'TOM': 'ema2-eu-tom-team@amazon.com',
            'TOM Leads': 'ema2-eu-tom-leads@amazon.com',
            'OB': 'ema2-shipping@amazon.com',
            'OB Leads': 'ema2-ob-leads@amazon.com',
            'IB': 'ema2-ib-dock@amazon.com',
            'IB Leads': 'ema2-ib-leads@amazon.com',
            'Mangers': 'ema2-managers@amazon.com'
        },
        "ERF1": {
            'TOM': 'erf1-eu-tom-team@amazon.com',
            'TAM': 'mbburdak@amazon.de',
            'OB': 'erf1-shipping@amazon.de',
            'IB': 'erf1-ib-dock-sme@amazon.com'
        },
        "ETZ2": {
            'OB Ops': 'etz2-outbound-ops@amazon.com',
            'TOM Leads': 'etz2-eu-tom-leads@amazon.com',
            'Ship AM': 'etz2-shipping-managers@amazon.com',
            'Escalation Week': 'zomenos@amazon.fr',
            'OB General': 'etz2-outbound@amazon.com',
            'OB Managers': 'etz2-outbound-manager@amazon.com',
            'Dock AM': 'etz2-dockteam@amazon.com',
            'SOM': 'dmmih@amazon.lu',
            'TAM': 'mtapioca@amazon.fr',
            'TOM': 'ETZ2-eu-tom-team@amazon.com'
        },
        "EUK1":{
            'OSY Team':'osy-team@amazon.com',
            'Yard': 'SECURITYEUK1@PARK-YOUR-TRUCK.COM'
        },
        "EUK5": {
            'OB Shipping': 'euk5-shipping@amazon.com',
            'OB Leads':'euk5-ob-leads@amazon.com',
            'Dock Managers': 'euk5-dock-managers@amazon.com',
            'IB Shipping': 'euk5-inbound@amazon.com',
            'IB Dock': 'euk5-dockteam@amazon.com',
            'IB Leads': 'euk5-ib-leads@amazon.com',
            'TOM Team': 'euk5-eu-tom-team@amazon.com',
            'OB Managers': 'euk5-ob-managers@amazon.com',
            'IB Managers': 'euk5-ib-managers@amazon.com'
        },
        "EBLG": {
            'Duty Manager': 'lggduty@baservices.aero',
            'Belgium Airport Services (3P)': 'amazon@baservices.aero',
            'Carlos Espinal': 'cespinl@amazon.lu'
        },
        "FRA3": {
            'Case Management Group (IB and OB)': 'fra3-roadrunner@amazon.com',
            'OB Ship AM': 'fra3-shipmanager@amazon.com',
            'VENDOR RETURNS': 'fra3-vret@amazon.com',
            'Ship OM Lea Rudolph': 'lerudol@amazon.com',
            'IB Dock AM': 'fra3-dock-manager@amazon.com',
            'IB Dock SME Tobias Goeb': 'togoeb@amazon.de',
            'OB SOM Calvin Roth': 'calvirot@amazon.de',
            'IB SOM Pia Groeger': 'pgroege@amazon.de',
            'ROM James Dieterle': 'jdieterl@amazon.de',
            'CRET OM Tobias Goeb': 'togoeb@amazon.de'
        },
        "FRA7": {
            'MASTER': 'melavolf@amazon.com, melder@amazon.de, ljannik@amazon.de',
            'TOM Team': 'fra7-eu-tom-team@amazon.com',
            'YARD': 'iverf@amazon.de',
            'Outbound General': 'fra7-shipping@amazon.com',
            'Outbound Managers': 'fra7-shipmanager@amazon.com',
            'Outbound (Vendor Returns)': 'fra7-vret@amazon.com',
            'Inbound General': 'fra7-inbound-clerks@amazon.com',
            'Inbound Leads': 'fra7-inbound-ops@amazon.com',
            'Inbound Managers': 'fra7-inbound-manager@amazon.com'
        },
        "FRAX": {
            'TOM Team': 'frax-eu-tom-team@amazon.com',
            'Ops General': 'frax-logistics@amazon.com',
            'Leads': 'frax-supervisors@amazon.com',
            'Managers': 'frax-managers-operations@amazon.com'
        },
        "FCO1": {
            'TOM Leads': 'fco1-eu-tom-leads@amazon.com',
            'TOM Team': 'fco1-eu-tom-team@amazon.com',
            'OB General': 'fco1-shipping@amazon.com',
            'OB General 2': 'fco1-shipping-case@amazon.com',
            'Alessio Compagnoni': 'alessico@amazon.it',
            'Lucia Monterosso': 'luciamon@amazon.it',
            'IB Leads': 'fco1-ib-lead@amazon.com',
            'IB Dock Managers': 'fco1-dock-manager@amazon.com',
            'IB Dock': 'fco1-dock-team@amazon.com',
            'IB Managers': 'fco1-inbound-manager@amazon.com',
            'CRET': 'fco1-ship-managers@amazon.com',
            'TAM': 'capanni@amazon.it',
            'TOM': 'FCO1-eu-tom-team@amazon.com '
        },
        "FCO2": {
            'Alessio Folcarelli': 'folcarel@amazon.com',
            'TOM Team': 'FCO2-eu-tom-team@amazon.com',
            'TOM Leads': 'fco2-eu-tom-leads@amazon.com',
            'Ship Dock': 'fco2-ship-managers@amazon.com',
            'Ship Dock Lead': 'fco2-ship-leads@amazon.com',
            'Inbound Dock Team': 'fco2-inbounddock@amazon.com',
            'Inbound Managers': 'fco2-inbound-manager@amazon.com',
            'Inbound Ops': 'fco2-inbound-ops@amazon.com',
            'Inbound Leads': 'fco2-inbound-leads@amazon.com',
            'Returns': 'fco2-epal-returns@amazon.com',
            'TAM': 'jacopori@amazon.it',
            'TOM': 'FCO2-eu-tom-team@amazon.com'
        },
        "FCO5": {
            'OPS Team': 'fco5-managers@amazon.com',
            'TOM Team': 'fco5-eu-tom-team@amazon.com',
            'OB Team': 'fco5-outbound@amazon.com',
            'IB Team': 'fco5-inbound@amazon.com',
            'TOM': 'FCO5-eu-tom-leads@amazon.com'
        },
        "FCO9": {
            'FCO9 Ops': 'fco9-ops@amazon.com',
            'General': 'fco9-shipping@amazon.it'
        },
        "FWHAL": {
            'Finsterwalder Team': 'hhn9-managers@amazon.com'
        },
        "HBE7":{
            'General': 'raul.bueno@letsgoi.com',
            'General Team': 'es-amxl-hbe7@amazon.com',
            'Site Manager': 'msjulia@amazon.com',
            'Buddy Site': 'agabsan@amazon.com'
        },
        "HBW3": {
            'General': 'hbw3-amxl@amazon.com',
            'Michael Makovec': 'mmakovec@amazon.de'
        },
        "HFR4": {
            'OB' : 'fr-amxl-hfr4@amazon.com',
            'OB Logistique' : 'contact@oclogistique.com',
            'IB' : 'fr-amxl-hfr4@amazon.com',
            'IB Logistique' : 'contact@oclogistique.com',
            'Yard 1' : 'jlecomte@oclogistique.com',
            'Yard 2' : 'lpamart@oclogistique.com',
            'Master' : 'jukrier@amazon.fr'
        },
        "HLG4": {
            'HLG4 Team': 'it-hlg4-amxl@amazon.com',
            'Operativo Piacenza': 'operativo.piacenza@tservicespa.com',
            'Ivan Ingegno': 'ivan.ingegno@tservicespa.com',
            'Jorawar Singh': 'jorawar.singh@tservicespa.com',
            'Antonio Schiavone': 'antonio.schiavone@tservicespa.com'
        },
        "HHN9": {
            'HHN9 Managers': 'hhn9-managers@amazon.com',
            '3PL Team': 'hhn9-3pl@amazon.com'
        },
        "HME8": {
            'HLZ1': 'hlz1-amxl@amazon.com'
        },
        "HLO2": {
            'General': 'hlo2-amxl@amazon.com'
        },
        "HNP4": {
            'General': 'hnp4-italy-amxl@amazon.com',
            'Master POC': 'sppelucc@amazon.com'
        },
        "HRM2 ": {
            'Master':'harrmada@amazon.co.uk'
        },
        "HVN1 ": {
            'OB': 'it-hvn1-amxl@amazon.com',
            'IB': 'it-hvn1-amxl@amazon.com',
            'Yard': 'it-hvn1-amxl@amazon.com',
            'Master': 'it-hvn1-amxl@amazon.com'
        },
        "HVX6 ": {
            'OB & IB': 'at-hvx6-amxl@amazon.com',
            '3PL OPS DS' : 'd.kahraman@cftransport.at',
            '3PL OPS NS' : 'f.yavas@cftransport.at',
            'OB POC' : 'f.kaymak@cftransport.at',
            'Master' : 'sehammer@amazon.at'
        },
        "HAJA": {
            'Mile Ristic': '4mristic@amazon.de',
            'HAJA (3P)': 'HAJA@ash-cargo.de',
            'HAJA - Ansgar Hund (3P)': 'A.Hund@ash-cargo.de'
        },
        "HAJ1": {
            'TOM': 'haj1-eu-tom-team@amazon.com',
            'OB Manager': 'haj1-ob-manager@amazon.com',
            'Inbound Team': 'haj1-inbound@amazon.com',
            'Dock Team': 'haj1-dock-team@amazon.com',
            'IB OPS': 'haj1-inbound-ops@amazon.com',
            'IB Manager': 'haj1-ib-manager@amazon.com'
        },
        "HAJ8": {
            'Outbound / Inbound Leadership': 'haj8-eu-tom-leads@amazon.com',
            'Supervisors': 'haj8-supervisors@amazon.com',
            'CLPM Team (Scheduling Esc.)': 'clpm-ats-de@amazon.com',
            'Managers': 'haj8-managers@amazon.com',
            'Manager POC': 'pardia@amazon.com'
        },
        "HAM2": {
            'TOM': 'ham2-eu-tom-team@amazon.com',
            'HAM2 Ship Dock | All shifts': 'ham2-shipping@amazon.com',
            'HAM2 TOM-Team | All shifts': 'ham2-gatehouse-supervisors@amazon.de',
            'VENDOR RETURNS': 'ham2-vendor-returns@amazon.com',
            'ham2-inbound-manager': 'ham2-inbound-manager@amazon.com'
        },
        "HBE1": {
            'General': 'hbe1-amxl@amazon.com'
        },
        "HBE2": {
            'General': 'hbe2-amxl@amazon.com'
        },
        "HDU1":{
            'General': 'hdu1-de-amxl@amazon.com',
            'General 2': 'hdu1-amxl@amazon.com'
        },
        "HIG3":{
            'POC 1': 'chrsstef@amazon.com',
            'POC 2': 'bbartrop@amazon.com'
        },
        "HMU3": {
            'General': 'hmu3-de-amxl@amazon.de',
            'Marco Fragione': 'fragmarc@amazon.de',
            'HTR2 - Buddy Site': 'htr2-amxl@amazon.com'
        },
        "HNM5": {
            'HNM5 Team': 'hnm5-amxl@amazon.com'
        },
        "HNX4": {
            'HNX4 Team': 'hnx4-ops@amazon.com'
        },
        "HOX2": {
            'Master': 'grodoski@amazon.com'
        },
        "HSA7": {
            'Master 1' : 'kolopovi@amazon.com',
            'Master 2' : 'benlyons@amazon.co.uk'
        },
        "HSN1": {
            'Master' : 'hsn1-supervisor@amazon.com'
        },
        "HSB1 ": {
            'POC 1':'sadaqaah@amazon.com',
            'POC 2': 'azdonjet@amazon.de',
            'POC 3': 'rankseba@amazon.de',
            'POC 4': 'ryannii@amazon.de',
            'General': 'hsb1-amxl@amazon.com'
        },
        "HST1":{
            'Master': 'mattfros@amazon.co.uk'
        },
        "HTN7": {
            'Master': 'reidnmr@amazon.co.uk',
            'Yard': 'mtrebins@amazon.co.uk'
        },
        "HTR2": {
            'OB & IB': 'htr2-amxl@amazon.com',
            'Master 1' : 'ejinie@amazon.com',
            'Master 2' : 'rechitea@amazon.de',
            'Master 3' : 'ayommoha@amazon.de'
        },
        "HXM1":{
            'General': 'uk-amxl-hxm1@amazon.com',
            'Master': 'abbeldim@amazon.com'
        },
        "HXW3": {
            'General': 'uk-amxl-hxw3@amazon.com',
            'Master' : 'mitchsam@amazon.com'
        },
        "IBA9": {
            'Master POC': 'matin@amazon.co.uk'
        },
        "IST2": {
            'OB Manager': 'turhaoz@amazon.com.tr',
            'Shipment': 'turhaoz@amazon.com.tr',
            'IB Dock': 'uatmaca@amazon.com.tr',
            'IB Manager': 'evrenc@amazon.com.tr',
            'Case Mng': 'ist2-ib-leads@amazon.com',
            'Regional TOM': 'tombrueg@amazon.de'
        },
        "IUKM":{
            'POC': 'ihemin@amazon.com'
        },
        "KELG":{
            'Primary' : 'Project.Amazon.Liege.KEC.OPS@kerrylogistics.com',
            'Escalation 1': 'fdarimont@cacesa.com',
            'Escalation 2': 'hschlaefli@cacesa.com',
            'Escalation 3': 'adrianna.ponce@times-ecommerce.com'
        },
        "KTW1": {
            'OB clerks/leads': 'ktw1-ship-clerks@amazon.com',
            'OB ship Area Managers': 'ktw1-ship-managers@amazon.com',
            'Outbound (Vendor Returns)': 'ktw1-vret-managers@amazon.com',
            'IB clerks/leads': 'ktw1-dock-team@amazon.com',
            'IB dock Area Managers': 'ktw1-dock-managers@amazon.com',
            'CustomerReturns clerks/leads': 'ktw1-customerreturns-dock@amazon.com',
            'CustomerReturns dock Area Managers': 'ktw1-customerreturns-managers@amazon.com'
        },
        "KTW3": {
            'Outbound Managers': 'ktw3-ship-managers@amazon.com',
            'Outbound': 'ktw3-ship-clerk@amazon.com',
            'Inbound': 'ktw3-dock-clerk@amazon.com',
            'Inbound Managers': 'ktw3-dock-managers@amazon.com'
        },
        "KTW5": {
            'Outbound': 'ktw5-ship-managers@amazon.com',
            'IB': 'ktw5-dock-clerk@amazon.com',
            'Yard' :'akrzywik@amazon.pl'
        },
        "KSF7": {
            'KSF7 Area Managers': 'ksf7-areas@amazon.com',
            'CLPM Team (Scheduling Esc.)': 'clpm-ats-de@amazon.com'
        },
        "LA POSTE":{
            'POC': 'aline.remy@laposte.fr, clientamz.sincro@laposte.fr'
        },
        "LBA2": {
            'OB Leads': 'lba2-ob-leads@amazon.com',
            'Shipping': 'lba2-shipping@amazon.co.uk',
            'Vendor Returns': 'lba2-vreturns@amazon.com',
            'IB Leads': 'lba2-ib-leads@amazon.com',
            'IB Dock': 'lba2-ib-dockclerk@amazon.com',
            'Adrian Peacock': 'appeaco@amazon.co.uk',
            'OB Managers': 'lba2-ob-managers@amazon.com',
            'IB Managers': 'lba2-ib-managers@amazon.com'
        },
        "LBA4": {
            'TOM' : 'lba4-tom-team@amazon.com',
            'TOM Leads' : 'lba4-tom-leadership@amazon.com',
            'OB Dock' : 'lba4-ob-dock@amazon.com',
            'OB Leads' : 'lba4-ob-leads@amazon.com',
            'IB Dock' : 'lba4-dock@amazon.com',
            'IB Leads' : 'lba4-ib-leads@amazon.com',
            'Master' : 'joeco@amazon.co.uk'
        },
        "LBA5": {
            'OB' :'sujmalik@amazon.co.uk',
            'IB 1' : 'sdlwm@amazon.co.uk',
            'IB 2' : 'hardvats@amazon.co.uk',
            'IB 3': 'natbol@amazon.co.uk',
            'Yard' : 'lba5-eu-tom-leads@amazon.com',
            'Master' : 'lba5-leadership@amazon.com'
        },
        "LEBL": {
            'Staff on duty': 'operaciones.bcn@aclhandling.com',
            'ACL escalation Team POCs': 'ferran.saenz@aclhandling.com, oscar.haj@aclhandling.com',
            'Amazon escalation POC': 'sanjuj@amazon.com'
        },
        "LCJ2": {
            'OB Case': 'lcj2-ship-leads@amazon.com',
            'IB Case': 'lcj2-ib-dockclerks@amazon.com',
            'Vendor Returns': 'lcj2-vendor-returns@amazon.com',
            'TOM': 'lcj2-eu-tom-team@amazon.com',
            'Master':'pdemusz@amazon.co.uk',
            'TOM TL': 'LCJ2-eu-tom-team@amazon.com'
        },
        "LCJ3": {
            'OB & IB': 'lcj3-am@amazon.com',
            'Vendor': 'lcj3-vendor-returns@amazon.com',
            'TOM': 'lcj3-am@amazon.com',
            'Manager I': 'mwwieczo@amazon.pl',
            'Manager II': 'kusmidro@amazon.pl'
        },
        "LEJ1": {
            'Ship': 'lej1-shipping@amazon.com',
            'Inbound': 'lej1-inbound-area@amazon.com',
            'Inbound OPS': 'lej1-inbound-ops@amazon.com',
            'TOM Leads': 'lej1-eu-tom-lead@amazon.com'
        },
        "LEJ3": {
            'TOM' :'lej3-eu-tom-team@amazon.com',
            'OB 1': 'lej3-outbound-ship@amazon.com',
            'OB 2': 'lej3-case-outbound@amazon.com',
            'IB 1': 'lej3-case-inbound@amazon.com',
            'IB 2': 'lej3-inbound-ops@amazon.de',
            'Management Team': 'lej3-ops@amazon.de',
            'Manager': 'dommau@amazon.de'
        },
        "LEJ7": {
            'TOM': 'lej7-eu-tom-team@amazon.com',
            'Master': 'rwaltam@amazon.com',
            'SLT' : 'lej7-slt@amazon.com'
        },
        "LIRF": {
            '3PL POC': 'Marco.Serra@bcube.com',
            'Amazon POC': 'rmanom@amazon.it'
        },
        "LIL1": {
            'Ship AM': 'lahoucib@amazon.com',
            'TOM Team': 'lil1-eos-tom-report@amazon.com',
            'TOM Support': 'lil1-support-lead-tom@amazon.com',
            'TOM General': 'lil1-tom@amazon.com',
            'Yann Lucidarme': 'yalucida@amazon.com',
            'shipping manager': 'lil1-shipping-manager@amazon.com',
            'OB General': 'lil1-outbound-shipping@amazon.com',
            'OB Leads': 'lil1-outbound-leads@amazon.com',
            'Returns 1': 'boulafro@amazon.com',
            'Returns 2': 'borghf@amazon.fr',
            'Nicolas Priem': 'priemn@amazon.com',
            'Inbound Managers': 'lil1-inbound-manager@amazon.com',
            'IB Dock': 'lil1-inbound-dock@amazon.com',
            'IB': 'lil1-sco@amazon.com',
            'Pascal Carre': 'pasccarr@amazon.fr',
            'TAM': 'yalucida@amazon.fr',
            'TOM': 'lil1-lead-tom@amazon.com'
        },
        "LIL8": {
            'Direct POC' : 'antochlo@amazon.com',
            'Master': 'maunierk@amazon.it',
            'TOM Leads': 'lil8-tom@amazon.com',
            'Area Managers': 'fr-ats-lil8-areamanagers@amazon.com',
            'TAM': 'raauvert@amazon.fr',
            'TOM': 'lil8-tom@amazon.com'
        },
        "LIN8": {
            'OB': 'outbound-lin8@amazon.com',
            'IB': 'lin8-ib-am@amazon.com',
            'TAM': 'wanfredi@amazon.com',
            'TOM': 'LIN8-eu-tom-team@amazon.com'
        },
        "LCJ4": {
            'Master': 'kusmidro@amazon.com, proksana@amazon.pl, trebusie@amazon.com',
            'OB Managers': 'lcj4-outbound-managers@amazon.com',
            'OB leads': 'lcj4-ship-leads@amazon.com',
            'Ship Clerk': 'lcj4-ship-clerks@amazon.com',
            'Outbound Vendor Returns': 'lcj4-vret-managers@amazon.com',
            'Dock Clerk': 'lcj4-dockclerks@amazon.com',
            'Dock AMs': 'lcj4-docksme@amazon.com',
            'IB Managers (CustomerReturns)': 'lcj4-customerreturns-managers@amazon.com'
        },
        "LEJ5": {
            'ROM (TOM Regional)': 'jdieterl@amazon.de',
            'Inbound SOM': 'kahldani@amazon.de',
            'Outbound SOM': 'jansenc@amazon.lu',
            'TOM Leads': 'lej5-tom@amazon.com',
            'TOM Team': 'lej5-eu-tom-team@amazon.com',
            'Outbound (Vendor Returns)': 'lej5-vret@amazon.com',
            'Case Management (Clerks/Leads)': 'lej5-ib-dock@amazon.de'
        },
        "LPL2": {
            'OB': 'lpl2-outbound@amazon.com',
            'Vendor Returns': 'lpl2-ob-mgrs@amazon.com',
            'IB': 'lpl2-inbound@amazon.com',
            'Ibrar Ahmed': 'ibrarahm@amazon.co.uk',
            'Yard': 'lpl2-eu-tom-leads@amazon.com',
            'OB Managers': 'lpl2-ob-mgrs@amazon.com',
            'IB Managers': 'lpl2-ib-managers@amazon.com'
        },
        "LPL9": {
            'General': 'uk-ats-lpl9-ups-supervisors@amazon.com',
        },
        "LTN4": {
            'Ship': 'ltn4-shipping@amazon.com',
            'OB Leads': 'ltn4-ob-leads@amazon.com',
            'Vendor Returns': 'ltn4-vendor-returns@amazon.com',
            'IB Dock': 'ltn4-ib-dock@amazon.com',
            'IB Leads': 'ltn4-ib-leads@amazon.com',
            'TOM': 'ltn4-eu-tom-team@amazon.com',
            'TOM Leads': 'ltn4-eu-tom-leads@amazon.com',
            'OB Managers': 'ltn4-ob-mgrs@amazon.com',
            'IB Managers': 'ltn4-ib-managers@amazon.com',
            'TOM Leads': 'ltn4-eu-tom-leads@amazon.com',
            'Mallikarjun Erasu': 'erasum@amazon.co.uk'
        },
        "LTN7": {
            'TOM': 'ltn7-eu-tom-team@amazon.co.uk',
            'OB Team': 'ltn7-ob@amazon.com',
            'OB Leads': 'ltn7-ob-leads@amazon.com',
            'IB Leads': 'ltn7-ib-leads@amazon.com',
            'IB Team': 'ltn7-ib@amazon.com',
            'Master': 'ltn7-eu-tom-leads@amazon.com'
        },
        "LYS1": {
            'OB managers': 'lys1-outbound-manager@amazon.com',
            'Yard': 'lys1-yardhouse@amazon.com',
            'Returns': 'alexanym@amazon.fr',
            'IB manager': 'lys1-inbound-manager@amazon.com',
            'TAM': 'amrojad@amazon.fr',
            'TOM': 'LYS1-eu-tom-team@amazon.com '
        },
        "LYS8": {
            'Abshat': 'abshat@amazon.com',
            'LYS8 shipping team': 'lys8-shipping-team@amazon.com',
            'TAM': 'abshat@amazon.fr',
            'TOM': 'LYS8-eu-tom-team@amazon.com '
        },
        "LBA8": {
            'TOM Leads': 'lba8-eu-tom-leads@amazon.com',
            'Supervisors': 'uk-ats-lba8-supervisors@amazon.com',
            'Managers': 'uk-ats-lba8-managers@amazon.com'
        },
        "LBA9": {
            'TOM Leads': 'lba9-eu-tom-leads@amazon.com',
            'Sheikh, Imran (N TAM)': 'isshei@amazon.com',
            'Managers': 'uk-ats-lba9-managers@amazon.com'
        },
        "LCY2": {
            'TOM Leads': 'lcy2-eu-tom-leads@amazon.com',
            'TOM Team': 'lcy2-eu-tom-team@amazon.com',
            'Outbound General': 'lcy2-shipam@amazon.com',
            'Outbound Leads': 'lcy2-ob-leads@amazon.com',
            'Outbound (Vendor Returns)': 'lcy2-vendorreturns@amazon.com',
            'Outbound Managers': 'lcy2-obmanagers@amazon.com',
            'Inbound General': 'lcy2-ib-dock@amazon.com',
            'Inbound Leads': 'lcy2-ib-leads@amazon.com',
            'Inbound Managers': 'lcy2-ibmanagers@amazon.com'
        },
        "LCY3": {
            'IB Leads': 'lcy3-ib-leads@amazon.com',
            'OB Leads': 'lcy3-ob-managers@amazon.com',
            'SHIPPING MENAGERS': 'lcy3-shipping-managers@amazon.com',
            'SHIPPING': 'lcy3-ob-shipping@amazon.com',
            'TOM Team': 'lcy3-eu-tom-team@amazon.com',
            'TOM Leads': 'lcy3-eu-tom-leads@amazon.com',
            'VENDOR RETURNS': 'lcy3-vendor-returns@amazon.com',
            'Bookings': 'lcy3-bookings@amazon.com',
            'lcy3 ib dock team': 'lcy3-ib-dock@amazon.com'
        },
        "LCY8": {
            'Managers': 'uk-ats-lcy8-managers@amazon.com',
            'Shipping': 'uk-ats-lcy8-shipping@amazon.com',
            'TOM Team': 'uk-ats-lcy8-eu-tom-leads@amazon.com',
            'Ops General': 'uk-ats-lcy8-ops@amazon.com',
            'Dock Supervisors': 'uk-ats-lcy8-docksupervisors@amazon.com'
        },
        "LEJA":{
            'Operations': 'amazon@portground.com',
            'Manager': 'mristic@amazon.de'
        },
        "LTN1": {
            'LTN1 Shipping': 'ltn1-shipping@amazon.com',
            'OB Managers': 'ltn1-operations-managers@amazon.com',
            'Shipping Leads': 'ltn1-shipping-leads@amazon.com',
            'OB Team': 'ltn1-outbound1@amazon.com',
            'VENDOR RETURNS': 'ltn1-vendor-returns@amazon.com',
            'LTN1-TOM TEAM': 'ltn1-eu-tom-team@amazon.com',
            'IB Dock': 'ltn1-inbound-dock@amazon.com',
            'IB Leads': 'ltn1-inboundleads@amazon.com',
            'IB Nights': 'ltn1-inboundnights@amazon.com'
        },
        "MAN1": {
            'OB Dock': 'man1-shipping@amazon.com',
            'OB Leads': 'man1-ob-leads@amazon.com',
            'Shipping': 'man1-shipping-leadership@amazon.com',
            'VENDOR RETURNS': 'man1-vreturns@amazon.com',
            'OB Managers': 'man1-shipping-managers@amazon.com',
            'IB Leads': 'man1-ib-leads@amazon.com',
            'IB Clerks': 'man1-dock-clerks@amazon.com',
            'IB Managers': 'man1-ib-managers@amazon.com',
            'TOM Leads': 'man1-eu-tom-leads@amazon.com'
        },
        "MAN4": {
            'TOM Leads': 'man4-eu-tom-leads@amazon.com',
            'Outbound Managers': 'man4-outboundmanagers@amazon.com',
            'MAN4 Shipping': 'man4-shipping@amazon.com',
            'Outbound (Vendor Returns)': 'man4-vret@amazon.com',
            'Inbound General': 'man4-ib-dockclercks@amazon.com',
            'Inbound Leads': 'man4-inbound-leads@amazon.com',
            'Inbound Managers': 'man4-inboundmanagers@amazon.com'
        },
        "MAN8": {
            'TOM team': 'man8-eu-tom@amazon.com',
            'MAN8 managers': 'uk-ats-man8-managers@amazon.com',
            'Inbound SOM': 'sirova@amazon.com',
            'TOM SOM': 'jafras@amazon.com',
            'Master': 'luqdavid@amazon.com'
        },
        "MAD4": {
            'TOM Team': 'mad4-eu-tom-team@amazon.com',
            'Managers': 'mad4-outbound-managers@amazon.com',
            'MAD4OUTBOUND': 'mad4-outbound-shipping@amazon.com',
            'VENDOR RETURNS': 'mad4-vret-managers@amazon.com',
            'MAD4INBOUND': 'mad4-inbound-managers@amazon.com',
            'CRET': 'mad4-reverse-manager@amazon.com',
            'TAM': 'munozsan@amazon.com',
            'TOM': 'MAD4-eu-tom-team@amazon.com '
        },
        "MAD6": {
            'Regional TOM': 'eljud@amazon.com',
            'TAM': 'micheltg@amazon.es',
            'OB SOM': 'ferreraa@amazon.com',
            'IB SOM': 'manuquir@amazon.com',
            'TOM Team': 'mad6-tom-lead@amazon.com',
            'TOM Team 2': 'mad6-eu-tom-team@amazon.com',
            'Dock Team': 'mad6-outbound-ship@amazon.com',
            'Returns POC': 'lejpal@amazon.es',
            'Returns POC 2': 'lodiaz@amazon.com',
            'OB OPs Manager': 'mafaldar@amazon.com',
            'IB managers': 'mad6-ib-managers@amazon.com',
            'IB Dock': 'mad6-ib-dock-team@amazon.com',
            'RELO Managers': 'mad6-reverse-managers@amazon.com',
            'RELO Leads': 'mad6-reverse-leads@amazon.com',
            'IB SME': 'esishern@amazon.com',
            'TOM': 'MAD6-eu-tom-team@amazon.com '
        },
        "MAD7": {
            'IB Ops': 'mad7-inbound-ops@amazon.com',
            'TOM LEADS': 'mad7-eu-tom-leads@amazon.com',
            'OB Dock Area Managers': 'mad7-ship-managers@amazon.com',
            'OB General': 'mad7-outbound-managers@amazon.com',
            'IB Dock Area Managers': 'mad7-dock-managers@amazon.com',
            'IB Dock': 'mad7-inbound-dock@amazon.com',
            'IB Managers': 'mad7-inbound-managers@amazon.com',
            'RELO': 'mad7-vendor-returns@amazon.com',
            'TAM': 'mfrago@amazon.es',
            'TOM': 'MAD7-eu-tom-team@amazon.com'
        },
        "MAD8": {
            'MAD8 General': 'mad8-am@amazon.com',
            'MAD8 General 2': 'mad8-ym@amazon.com',
            'general': 'mad8-cases@amazon.com',
            'TOM': 'MAD8-eu-tom-team@amazon.com ',
            'Fernando Dominguez': 'fferd@amazon.com',
            'Claudia Burgos Delgado': 'declaud@amazon.es',
            'TAM': 'sncdni@amazon.com'
        },
        "MAD9": {
            'Regional TOM': 'danpasto@amazon.com',
            'IB SOM': 'marlunm@amazon.com',
            'OB SOM': 'gmmeconi@amazon.com',
            'Yard': 'mad9-eu-tom-leads@amazon.com',
            'TAM': 'micheltg@amazon.es',
            'Ship AM': 'mad9-ship-managers@amazon.com',
            'OB Ops': 'mad9-outbound-ops@amazon.com',
            'OB Night Shift POC': 'jperote@amazon.com',
            'IB Ops': 'mad9-inbound-ops@amazon.com',
            'IB Managers': 'mad9-inbound-managers@amazon.com',
            'IB Dock': 'mad9-inbound-dock-clerk@amazon.com',
            'IB Bookings': 'mad9-inbound-bookings@amazon.com',
            'TOM': 'mad9-eu-tom-leads@amazon.com '
        },
        "MADC": {
            'MAD8 General': 'mad8-am@amazon.com',
            'MAD8 General 2': 'mad8-ym@amazon.com',
            'general': 'mad8-cases@amazon.com',
            'TOM': 'mad8-eu-tom-team@amazon.com',
            'TOM LEADS': 'mad8-eu-tom-leads@amazon.com',
            'Fernando Dominguez': 'fferd@amazon.com',
            'Claudia Burgos Delgado': 'declaud@amazon.es'
        },
        "MAN2": {
            'Yard': 'man2-eu-tom-team@amazon.com',
            'Master': 'man2-ob-managers@amazon.com',
            'OB Leads': 'man2-shipping@amazon.com',
            'IB': 'man2-ib-cases@amazon.com'
        },
        "MAN3": {
            'OB Cases': 'man3-cases@amazon.com',
            'OB Leads': 'man3-obleads@amazon.com',
            'Shipping': 'man3-shipping@amazon.com',
            'IB Cases': 'man3-cases@amazon.com',
            'IB Leads': 'man3-ibleads@amazon.com',
            'IB Managers': 'man3-ibmanagers@amazon.com',
            'TOM Cases': 'man3-eu-tom-cases@amazon.com',
            'TOM Leads': 'man3-eu-tom-leads@amazon.com'
        },
        "MLDB": {
            'General' : 'it.dl.mil.ama-custom@dbschenker.com'
        },
        "MME1": {
            'OB Early' : 'mme1-ob-am@amazon.com',
            'OB Night': 'mme1-ob-nights-am@amazon.com',
            'OB Leads': 'mme1-ob-leads@amazon.com',
            'Shipping' : 'mme1-shipping@amazon.com',
            'Vendor FLEX': 'mme1-vret@amazon.com',
            'IB Dock': 'mme1-inbound-dock@amazon.com',
            'IB Dock 2': 'mme1-ib-dockclerk@amazon.com',
            'IB Leads' : 'mme1-ib-leads@amazon.com',
            'Yard' : 'mme1-eu-tom-team@amazon.com',
            'Managers': 'mme1-dock-managers@amazon.com'
        },
        "MME2": {
            'TOM': 'mme2-eu-tom-team@amazon.com',
            'General': 'mme2-ob@amazon.com',
            'OB Managers': 'mme2-ob-managers@amazon.com',
            'IB': 'mme2-ib-dock@amazon.com',
            'IB Managers': 'mme2-ib-ops@amazon.com'
        },
        "MONDIAL_RELAY_SAINT_QUENTIN_FR":{
            'POC':'vdugelet@mondialrelay.fr'
        },
        "MRS1": {
            'Constantin Anthony': 'conantho@amazon.com',
            'Comte-Gaz Florian': 'comtegaz@amazon.com',
            'Brulez Fabien': 'fburlez@amazon.com',
            'TOM Team': 'mrs1-tom@amazon.com',
            'Outbound dock': 'mrs1-outbound-shipping@amazon.com',
            'Returns': 'bechardl@amazon.fr',
            'Inbound dock': 'mrs1-inbound-dock@amazon.com',
            'TAM': 'fbrulez@amazon.com',
            'TOM': 'MRS1-eu-tom-team@amazon.com '
        },
        "MRS9": {
            'Ryan Bala': 'balarya@amazon.fr',
            'Site Leader': 'Maxime.Pereira@ctlog-international.com',
            'Ops Manager 1': 'eline.vidal@ctlog-international.com',
            'Ops Manager 2': 'Tabet.Sabri@ctlog-international.com',
            'Managers': 'mrs9-manager@amazon.com',
            'External 1': 'GRP_CTG_RE-MRS9@ctlog-international.com',
            'External 2': 'RP_CTG_admin-mrs9@ctlog-international.com'
        },
        "MXPA": {
            'General': 'amzn.mxp@bcube.com',
            'General 2': 'groundops.spv.mxp@bcube.com',
            'POC External': 'gianluca.farioli@bcube.com',
            'Marco Ronda': 'mronda@amazon.com',
            'Customs clearance': 'Project.Amazon.Malpensa.KEC.OPS@kerrylogistics.com'
        },
        "MXP3": {
            'TOM Team': 'mxp3-eu-tom-team@amazon.com',
            'TOM Leads': 'mxp3-eu-tom-leads@amazon.com',
            'Ship Team (OB and CO)': 'mxp3-outbound-dock@amazon.com',
            'Ship Managers (Escalations)': 'mxp3-outbound-ship@amazon.com',
            'IXD Team (WHT and TSO)': 'mxp3-ixd@amazon.com',
            'IB Managers (Escalations)': 'mxp3-inbound-manager@amazon.com',
            'TAM': 'vitumb@amazon.com',
            'TOM': 'MXP3-eu-tom-team@amazon.com'
        },
        "MXP5": {
            'IB': 'mxp5-dock@amazon.com',
            'OB': 'mxp5-shipping-ob-case@amazon.com',
            'TSO': 'mxp5-transshipment-ob-case@amazon.com',
            'XD - ReLo': 'mxp5-xdrelo-case@amazon.com',
            'TOM': 'mxp5-tom-team@amazon.com ',
            'OB - TSO': 'mxp5-dockob-am-case@amazon.com',
            'IXD': 'mxp5-xd-managers@amazon.com',
            'OB - TSO escalation': 'mxp5-ob-ops@amazon.com',
            'XD - ReLo escalation': 'mxp5-xdrelo-ops@amazon.com',
            'ReLo': 'mxp5-relo-managers@amazon.com',
            'IB DOCK AM': 'gcamerot@amazon.com',
            'IB escalation': 'mxp5-ib-ops@amazon.com',
            'TAM': 'lcarland@amazon.it'
        },
        "MXP6": {
            'TOM Team': 'mxp6-tom@amazon.com',
            'Ship Team': 'mxp6-shipping@amazon.com',
            'Ship Leads': 'mxp6-shipleads@amazon.com',
            'Ship Managers': 'mxp6-shipmanagers@amazon.com',
            'IB Managers': 'mxp6-inbound-managers@amazon.com',
            'IB Dock': 'mxp6-inbound-dock@amazon.com',
            'IB Ops': 'mxp6-inbound-ops@amazon.com',
            'TAM': 'lucgalli@amazon.it',
            'TOM': 'MXP6-eu-tom-team@amazon.com'
        },
        "MXP8": {
            'OPS': 'mxp8-ops@amazon.com',
            'AM': 'mxp8-am@amazon.com',
            'TAM': 'aaltier@amazon.it',
            'TOM': 'MXP8-eu-tom-team@amazon.com '
        },
        "MHG9": {
            'MHG9 Managers': 'mhg9-managers@amazon.com',
            '3PL clerks': 'mhg9-clerks-3pl@amazon.com',
            '3PL escalation': 'mhg9-3pl@amazon.com'
        },
        "MUC3": {
            'Outbound Team': 'muc3-shipping@amazon.com',
            'VENDOR RETURNS': 'muc3-vreturns-pc-team@amazon.com',
            'IB Team': 'muc3-inbound-dock@amazon.com',
            'TOM Manager': 'muc3-tomleaders@amazon.com',
            'IB OPS': 'muc3-inbound-ops@amazon.com',
            'OB OPS': 'muc3-outboundopsmgr@amazon.com'
        },
        "MUC7": {
            'TOM Leads': 'muc7-eu-tom-leads@amazon.com',
            'Supervisors': 'muc7-supervisors@amazon.com'
        },
        "MUC9": {
            'Cases': 'muc9-cases@amazon.com'
        },
        "NEH1": {
            'General': 'uk-amzl-neh1@amazon.com'
        },
        "OAO7":{
            'General': 'flex-scheduling-ops-notifications-oao7@amazon.com'
        },
        "OBG2": {
            'General': 'ddnc2-area-manager@amazon.com'
        },
        "OBG3": {
            'Manager': 'dbg2-managers@amazon.com'
        },
        "OBG5": {
            'Manager': 'dbg2-managers@amazon.com',
            'OB': 'dbg2-managers@amazon.com'
        },
        "OBG7": {
            'General 1': 'flex-scheduling-ops-notifications-obg7@amazon.com',
            'General 2': 'obg7-oba-notification@amazon.com'
        },
        "OCM2": {
            'General': 'dma8-amzn-hrly@amazon.com',
            'General 2': 'es-amzl-dma8@amazon.com'
        },
        "OTT2": {
            'General': 'it-amzl-dvn2@amazon.com'
        },
        "NCL1": {
            'Ship Managers': 'ncl1-shipams@amazon.com',
            'Bookings' : 'ncl1-bookings@amazon.com',
            'IB' : 'ncl1-ib-dock@amazon.com',
            'Yard': 'ncl1-eu-tom-team@amazon.com',
            'Master' : 'ncl1-bookings@amazon.com'

        },
        "NCL2": {
            'Shipping AM' : 'ncl2-ship-managers@amazon.com',
            'Shipping LT' : 'ncl2-shipping@amazon.com',
            'OB SOM' : 'jodamso@amazon.co.uk',
            'IB AM' : 'ncl2-ib-managers@amazon.com',
            'IB SOM' : 'batestho@amazon.co.uk',
            'IB Dock Team' : 'ncl2-ib-dock@amazon.com',
            'TOM TEAM': 'ncl2-eu-tom-team@amazon.com',
            'TOM Leads': 'ncl2-eu-tom-leads@amazon.com',
            'Managers': 'ncl2-managers@amazon.com'
        },
        "NUE1": {
            'OB Ship Mailing List': 'nue1-ob-ship-team@amazon.com',
            'Vendor Returns': 'nue1-ob-psvret-team@amazon.com',
            'IB Manager': 'nue1-ib-manager@amazon.com',
            'TOM Leads': 'nue1-ob-tom-team@amazon.com',
            'SOM': 'imhoflen@amazon.de'
        },
        "NUE9": {
            'Managers': 'nue9-managers@amazon.com',
            'TOM Team': 'nue9-eu-tom-team@amazon.com',
            'NUE9-Yard Team': 'nue9-casemanagement@amazon.com'
        },
        "OCN2":{
            'General': 'ocn2-oba-notification@amazon.com'
        },
        "OIF6": {
            'General':'dnd1-managers@amazon.com',
            'Ludovic Pierruci': 'l.pierucci@pro-courses.fr'

        },
        "OIF7":{
            'POC': 'dwv1-case-interests@amazon.com'
        },
        "OLG4": {
            'OLG4': 'it-amz-dlg1-mgmt@amazon.com'
        },
        "OMD3": {
            'OB': 'mad7-ship-managers@amazon.com',
            'IB': 'mad7-ship-managers@amazon.com',
            'Master': 'omd3-oba-notification@amazon.com'
        },
        "ONC2":{
            'OB': 'g.fisicaro@easy2go.fr',
            'Managers': 'dnc1-managers@amazon.com'
        },
        "OLZ3": {
            'Master': 'it-amzl-dlz2-mgmt@amazon.com'
        },
        "ORE2": {
            'Managers': 'it-amzl-dlz2-mgmt@amazon.com'
        },
        "ORY1": {
            'OB SOM': 'lerichel@amazon.fr',
            'Regional TOM': 'ggraziot@amazon.fr',
            'TOM Team Leads': 'ory1-eu-tom-leads@amazon.com',
            'TAM': 'ducgj@amazon.fr',
            'OB Ops': 'ory1-outbound-ops@amazon.com',
            'Ship Managers': 'ory1-shipping-management@amazon.com',
            'IB Managers': 'ory1-inbound-manager@amazon.com',
            'IB Ops': 'amarguet@amazon.fr',
            'TOM': 'ORY1-eu-tom-team@amazon.com '
        },
        "ORY4": {
            'OB Escalation': 'marcdan@amazon.fr',
            'IB escalation': 'nebraa@amazon.fr',
            'Tom team': 'ory4-eu-tom-leads@amazon.com',
            'AM TOM': 'ory4-eu-tom-managers@amazon.com',
            'SHIPPING': 'ory4-shipping-managers@amazon.com',
            'Returns': 'ory4-dockteam@amazon.com',
            'DOCK TEAM': 'ory4-dockteam@amazon.com',
            'Managers': 'ory4-inbound-manager@amazon.com',
            'Escalation': 'ory4-inbound-ops@amazon.com',
            'TAM': 'destlaur@amazon.fr',
            'TOM': 'ORY4-eu-tom-team@amazon.com '
        },
        "ORY8": {
            'General Leads': 'ory8-leads@amazon.com',
            'General Managers': 'ory8-managers@amazon.com',
            'General Shipping': 'ory8-shipping@amazon.com',
            'Master': 'ghaliben@amazon.com',
            'TOM LEAD': 'ory8-eu-tom-leads@amazon.com',
            'TOM': 'ORY8-eu-tom-team@amazon.com '
        },
        "OWL3": {
            'General': 'dwb2-managers@amazon.com',
            'External 1': 'clive.largillier@geodis.com'
        },
        "OWL6": {
            'General':'dwl1-managers@amazon.com'
        },
        "OWL7": {
            'General': 'mazars@amazon.fr2',
            'Manager' : 'dwl1-managers@amazon.com'
        },
        "OWP5": {
            'General': 'dwp1-managers@amazon.com',
            'Manager': 'thibautv@amazon.fr'
        },
        "OWP9":{
            'POC': 'flex-scheduling-ops-notifications-owp9@amazon.com'
        },
        "ORI1": {
            'Amazon DZG2': 'es-azml-dzg2@amazon.com'
        },
        "OSI5":{
            'General': 'it-amzl-dsi2@amazon.com'
        },
        "OTC6": {
            'General': 'it-amzl-dtc2@amazon.com',
            'Managers' : 'it-amzl-dtc2-mgmt@amazon.com'
        },
        "OVD1": {
            'OB' : 'ovd1-outbound-managers@amazon.com',
            'Ship' : 'ovd1-ship-leads@amazon.com',
            'IB' : 'ovd1-inbound-dock@amazon.com',
            'TOM' : 'ovd1-eu-tom-leads@amazon.com',
            'Managers' : 'ovd1-inbound-ops@amazon.com'
        },
        "PAD1": {
            'SOM Team': 'pad1-som@amazon.com',
            'OB OM Team': 'pad1-ob-om@amazon.com',
            'TOM Team': 'pad1-eu-tom-leads@amazon.com',
            'Outbound General': 'pad1-ob-cases@amazon.com',
            'Outbound Leads': 'pad1-shipping@amazon.com',
            'Outbound Managers': 'pad1-ob-cases-escalation@amazon.com',
            'Outbound (Vendor Returns)': 'pad1-vreturn@amazon.com',
            'IB OM Team': 'pad1-ib-om@amazon.de',
            'Inbound General': 'pad1-ib-dock@amazon.com'
        },
        "PAD2": {
            'Shipping General': 'pad2-shipping@amazon.de',
            'Shipping Managers': 'pad2-ship-manager@amazon.de',
            'Ship OM' : 'cifchamz@amazon.de',
            'TOM Team' : 'pad2-eu-tom-team@amazon.com',
            'SOM': 'pad2-som@amazon.com'
        },
        "PARA": {
            'PARA whs': 'fh-fbe-amz@wfs.aero',
            'Carmen Esplugues Barona (Amazon POC)': 'baronacb@amazon.com',
            'Anthony Del Pozo (WHS Manager)': 'adelpozo@wfs.aero'
        },
        "PDEM": {
            'Yard': 'pu-de-pdem@amazon.com',
            'OB':'pu-de-pdem@amazon.com',
            'IB':'pu-de-pdem@amazon.com'
        },
        "PDEQ": {
            'General': 'bharvitt@amazon.de'
        },
        "PESG": {
            'Operations': 'pesg-amxl-ops@amazon.com',
            'Master POC': 'cbbrena@amazon.com'
        },
        "PILH": {
            'Outbound': 'JessicaGriffiths@pallet-track.com',
            'KPILH, Amazon team': 'kapilh-directs@amazon.com'
        },
        "PNLD":{
            'Operations': 'pnld-ef-ops@amazon.com'
        },
        "POIT-BOLOGNA-IT": {
            'Pallet realease 1': 'POIT-BOLOGNA-IT',
            'Pallet release 2': 'PIERQ.CESARINI@POSTEITALIANE.IT',
            'Pallet release 3': 'FRANCESCO1.NERI@posteitaliane.it'
        },
        "POZ1": {
            'TOM Team': 'poz1-eu-tom-team@amazon.com',
            'TOM Leads': 'poz1-eu-tom-leads@amazon.com',
            'Outbound General': 'poz1-shipping-manager@amazon.com',
            'Outbound (Vendor Returns)': 'poz1-vreturn@amazon.com',
            'Unloading Delays': 'poz1-dock-clerk@amazon.com',
            'Unloading Delays Escalation': 'poz1-inbound-manager@amazon.com',
            'IB Cases': 'poz1-dock-team@amazon.com',
            'IB Cases Escalation': 'poz1-dock-manager@amazon.com'
        },
        "POZ2": {
            'Case Management Group Email': 'poz2-dock-clerk@amazon.com',
            'Escalation Group Email': 'poz2-dock-managers@amazon.com',
            'Dock SME': 'lataczl@amazon.pl',
            'VENDOR RETURNS': 'poz2-vreturn@amazon.com',
            'OB - IB SOM': 'poz2-senior-operations-managers@amazon.com'
        },
        "PRG2": {
            'Cases': 'prg2-shipping@amazon.com',
            'Ops Managers': 'prg2-shipping-manager@amazon.com',
            'IB Crew': 'prg2-dock-team@amazon.com',
            'IB Dock': 'prg2-dock-manager@amazon.com',
            'TOM': 'prg2-eu-tom-team@amazon.com',
            'YARD Petr Machytka': 'machytka@amazon.cz',
            'Regional TOM': 'tkusital@amazon.com'
        },
        "PRG9": {
            'Managers': 'prg9-managers@amazon.com',
            'Cases': 'prg9-cases@amazon.com'
        },
        "POD6": {
            'Master':'cramell@amazon.it'
        },
        "PSR2": {
            'TOM Leads': 'psr2-eu-tom-leads@amazon.com',
            'ROM - Iulian Teodorof': 'teodorof@amazon.com',
            'FC OM - Roberto Rocci': 'roccir@amazon.it',
            'Ship Dock AMs': 'psr2-ship-managers@amazon.it',
            'OB Managers': 'psr2-outbound-manager@amazon.com',
            'OB Escalation': 'psr2-outbound-ops@amazon.com',
            'OB OM - Anthony Grassi': 'ntgrss@amazon.it',
            'OB POC - Matteo Cidaria': 'mcidmatt@amazon.it',
            'IB Escalation': 'psr2-inbound-ops@amazon.it',
            'IB OM - Federico Girtenti': 'girgentf@amazon.it',
            'IB Managers': 'psr2-inbound-managers@amazon.com',
            'IB POC - Federica De Filippis': 'fedefili@amazon.it',
            'Dock Inbound AMs': 'psr2-dock-am@amazon.com',
            'TAM': 'rsschran@amazon.it',
            'TOM': 'psr2-eu-tom-team@amazon.com'
        },
        "PUKK":{
            'POC':'poolecon@amazon.com'
        },
        "PUKM":{
            'POC': 'pedleybp@amazon.com'
        },
        "RELAISCOLIS_COMBS_FR":{
            'Group Email': 'dl-rc-dtl-exploitation@relaiscolis.com',
            'Support 1': 'dlanoir@relaiscolis.com',
            'Support 2': 'dsoltysiak@relaiscolis.com',
            'Support 3' : 'epotonnier@relaiscolis.com',
            'CustomerReturns':'P4-GestionFlux1@relaiscolis.com'
        },
        "RMU1": {
            'Regional TOM': 'gaadavid@amazon.es',
            'OB SOM': 'xrribera@amazon.es',
            'IB SOM': 'mzmoren@amazon.es',
            'TOM Team Lead': 'rmu1-eu-tom-leads@amazon.com',
            'TOM Team RMU1': 'rmu1-eu-tom-team@amazon.com',
            'VRET': 'rmu1-vendor-returns@amazon.com',
            'OB Ship SME': 'chamori@amazon.es',
            'OB OPS': 'rmu1-outbound-ops@amazon.com',
            'OB Cases': 'rmu1-ship-team@amazon.com',
            'OB Cases Escalation': 'rmu1-ship-managers@amazon.com',
            'IB Support Service': 'rmu1-iss@amazon.com',
            'IB Dock SME': 'johog@amazon.com',
            'Unloading Delays Escalation': 'rmu1-inbound-ops@amazon.com',
            'IB OPS': 'rmu1-inbound-ops@amazon.com',
            'IB Cases': 'rmu1-inbound-dock@amazon.com',
            'IB Cases Escalation': 'rmu1-dock-managers@amazon.com',
            'TAM': 'lmendezg@amazon.com'
        },
        "Royal Mail": {
            'UK': 'jamie.p.hopper@royalmail.com,tracey.warren@royalmail.com, jo.robinson@royalmail.com , amazon@royalmail.com,maryann.holland@royalmail.com ,dave.parry@royalmail.com',
            'Escalations': 'natalie.oconnor@royalmail.com;dave.bebbington@royalmail.com; ian.clements@royalmail.com'
        },
        "RLG1": {
            'OB': 'rlg1-case-outbound@amazon.com',
            'OB Leads': 'rlg1-ship-leads@amazon.com',
            'IB Cases': 'rlg1-case-inbound@amazon.com',
            'IB Leads': 'rlg1-inbound-leads@amazon.com',
            'TOM': 'rlg1-eu-tom-team@amazon.com',
            'TOM Leads': 'rlg1-eu-tom-leads@amazon.com',
            'Management': 'ycclaus@amazon.de'
        },
        "SEUR":{
            'SEUR': 'david.sanchezs@seur.net, angel.santamaria@seur.net, david.cano@seur.net, carlos.ortiz@seur.net, javier.sanchezpla@seur.net, teresa.garcia@seur.net, leila.maujo@seur.net, torre.control@seur.net',
            'Vendor Return POCs': 'torre.control@seur.net, david.cano@seur.net'
        },
        "SNG1": {
            'SNG1 shipping': 'uk-ats-sng1-shipping@amazon.com',
            'General': 'uk-ats-sng1@amazon.com',
            'General 2': 'uk-ats-sng1-supervisors@amazon.com'
        },
        "STN8": {
            'General': 'uk-ats-stn8-supervisors@amazon.com',
            'Ship Team': 'uk-ats-stn8-shipping@amazon.com',
            'TOM': 'stn8-eu-tom-team@amazon.com',
            'TOM LEAD': 'stn8-eu-tom-leads@amazon.com',
            'Stefani Parada Medina': 'stefame@amazon.com'
        },
        "STN9": {
            'General': 'uk-ats-stn9-ups@amazon.com',
            'General 2': 'uk-ats-stn9-tl@amazon.com',
            'External 1': 'dredhead@ups.com',
            'External 2': 'carlagibson@ups.com'
        },
        "SXW2": {
            'Escalation IB OB': 'uk-ats-sxw2-slt@amazon.com',
            'Shipping': 'uk-ats-sxw2-supervisors@amazon.com',
            'Shipping- Escalation': 'uk-ats-sxw2-managers@amazon.com',
            'TOM': 'sxw2-eu-tom-team@amazon.com'
        },
        "SFMV": {
            'FMC_CASE': 'sfmv_fmc@sfmv.com'
        },
        "SCN8": {
            'TOM Team': 'scn8-eu-tom-team@amazon.de'
        },
        "SEKO": {
            'Tobias Helfrich': 'helfrt@amazon.com'
        },
        "SHIH": {
            'FMC_CASE': 'shih_fmc@shih.com',
            'Master': 'gaelle.lassalle@super10count.fr, julien.perriaux@super10count.fr'
        },
        "SHNN": {
            'FMC_CASE': 'shnn_fmc@shnn.com',
            'Master': 'placedelelectro@gmail.com'
        },
        "SHRT-CDG7-3": {
            'POC' : 'mw@park-your-truck.com'
        },
        "SBS2": {
            'OB/IB Ship Team': 'uk-amzl-sbs2-shipping@amazon.com',
            'OB/IB Escalation': 'vallto@amazon.co.uk',
            'TOM': 'sbs2-uk-tom-team@amazon.com',
            'TOM Leads': 'sbs2-eu-tom-leads@amazon.com',
            'Managers': 'uk-amzl-sbs2-managers@amazon.com',
            'Managers 2': 'uk-ats-sbs2-managers@amazon.com'
        },
        "SCN2": {
            'TOM Team': 'scn2-eu-tom-team@amazon.com',
            'TOM Leads': 'scn2-tom-leads@amazon.com',
            'Outbound Management': 'scn2-ob-manager@amazon.com',
            'Outbound Managers': 'scn2-shipmanager@amazon.com',
            'Outbound General': 'scn2-shipping@amazon.com',
            'Outbound (Vendor Returns)': 'scn2-vret@amazon.com',
            'Inbound Managers': 'scn2-ib-manager@amazon.de',
            'Inbound General': 'scn2-ibdock-leads@amazon.com'
        },
        "SDEV": {
            'SDEV': 'sdev-amxl-ops@amazon.com',
            'OB lead': 'xdev-teamleader-outb@id-logistics.com',
            'OB area manager': 'xdev-outbound@id-logistics.com',
            'IB lead': 'sdev-teamleader-crossdock@id-logistics.com',
            'IB area manager': 'sdev-crossdock@id-logistics.com'
        },
        "SNN4":{
            'Shipping': 'snn4-shipping@amazon.com',
            'OB Leads': 'snn4-ob-leads@amazon.com',
            'IB Clerk': 'snn4-ib-clerk@amazon.com',
            'IB Ops': 'snn4-ib-ops@amazon.com',
            'TOM Team': 'snn4-eu-tom-team@amazon.com',
            'TAM Support': 'sarahna@amazon.com',
            'OB Managers': 'snn4-ob-managers@amazon.com',
            'IB Managers': 'snn4-ib-managers@amazon.com'
        },
        "SNN5":{
            'OB Shipping': 'snn4-shipping@amazon.com',
            'OB Shipping Leads': 'snn4-ob-leads@amazon.com',
            'IB AM': 'snn5-ib-am@amazon.com',
            'IB Clerk': 'snn5-ib-clerk@amaozn.com',
            'IB Leads': 'snn5-ib-leads@amazon.com',
            'VENDOR Returns': 'snn4-vreturns@amazon.com',
            'TOM': 'snn4-eu-tom-team@amazon.com',
            'OB Managers': 'snn4-ob-managers@amazon.com',
            'IB Managers': 'snn4-ib-managers@amazon.com',
            'TOM Leads': 'snn4-tom-lead@amazon.com'
        },
        "SFPU":{
            'Cases' : 'sfpu_fmc@sfpu.com',
            'Master POC': 'm.schuon@schuon-logistik.de'
        },
        "STM3": {
            'OB & IB' : 'dtm3-area@amazon.com',
            'Yard' : 'dtm2-3-eu-tom-team@amazon.com',
            'Master 1' : 'flomut@amazon.com',
            'Master 2' : 'stricke@amazon.com'
        },
        "STR1": {
            'TOM Team': 'str1-tom-info@amazon.com',
            'Outbound Operations': 'str1-outbound-ops@amazon.com',
            'Outbound Managers': 'str1-ship-manager@amazon.com',
            'Outbound General': 'str1-shipping@amazon.com',
            'Outbound (Vendor Returns)': 'str1-vendor-returns@amazon.com',
            'Inbound General': 'str1-inbound-ops@amazon.com',
            'Inbound Managers': 'str1-inbound-manager@amazon.com'
        },
        "STR2": {
            'OB': 'str2-outbound@amazon.com',
            'OB Area': 'str2-area@amazon.com',
            'IB': 'str2-inbound@amazon.com',
            'IB Area': 'str2-area@amazon.com',
            'TOM': 'str2-eu-tom-team@amazon.com',
            'Operations 1': 'str2-ops@amazon.com',
            'Operations 2': 'str2-area@amazon.com'
        },
        "STR5": {
            'OB' : 'str2-outbound@amazon.com',
            'IB' : 'str2-inbound@amazon.com',
            'Yard' : 'str2-eu-tom-team@amazon.com',
            'Master' : 'str2-ops@amazon.com'
        },
        "STN7": {
            'OB Leads': 'ltn7-ob-leads@amazon.com',
            'OB Team': 'ltn7-ob@amazon.com',
            'OB Managers': 'ltn7-ob-managers@amazon.com',
            'IB Team': 'ltn7-ib@amazon.com',
            'IB Leads': 'ltn7-ib-leads@amazon.com',
            'IB Managers':'ltn7-ib-managers@amazon.com',
            'TOM': 'ltn7-eu-tom-team@amazon.co.uk',
            'LTN7 Managers': 'ltn7-managers@amazon.com'
        },
        "SVQ1": {
            'IB Ops': 'svq1-inbound-ops@amazon.com',
            'OB Ops': 'svq1-ob-ship-managers@amazon.com',
            'TOM team': 'svq1-eu-tom-team@amazon.com',
            'TOM Area Manager': 'joaqper@amazon.com',
            'TOM Leads': 'svq1-eu-tom-leads@amazon.com',
            'OB Dock AMs': 'svq1-outbound-ops@amazon.com',
            'IB Dock AMs': 'svq1-dock-managers@amazon.com',
            'IB Dock Team': 'svq1-dock-team@amazon.com',
            'TAM': 'joaqper@amazon.es',
            'TOM': 'SVQ1-eu-tom-team@amazon.com '
        },
        "SFIM": {
            'FMC_CASE': 'sfim_fmc@sfim.com',
            'Manager': 'l.mielke@haase-logistik.eu'
        },
        "SFMB": {
            'Hanse Logistik POC': 'j.fiutak@hanse-logistik.com',
            'FMC_CASE': 'sfmb_fmc@sfmb.com'
        },
        "SHST": {
            'FMC_CASE': 'shst_fmc@shst.com'
        },
        "SZZ1": {
            'TOM Leads': 'mariuto@amazon.com',
            'TOM Team': 'szz1-eu-tom-leads@amazon.com',
            'Outbound General': 'szz1-shipping@amazon.com',
            'Outbound Leads': 'szz1-shipclerk@amazon.com',
            'Outbound Managers': 'szz1-obops@amazon.com',
            'Outbound (Vendor Returns)': 'szz1-vendor-returns@amazon.com',
            'Inbound General': 'szz1-dock-team@amazon.com'
        },
        "TNT":{
            'UK': 'amazoncontroltower@tnt.co.uk'
        },
        "TRN1": {
            'OB' : 'trn1-ship-am@amazon.com',
            'IB Managers': 'trn1-inbound-managers@amazon.com',
            'Manager': 'marottad@amazon.com',
            'Vendor Returns': 'trn1-vendor@amazon.com',
            'TOM Team': 'trn1-eu-tom-team@amazon.com',
            'TOM Team 2': 'trn1-tom@amazon.com',
            'TOM GH': 'trn1-tom-gh@amazon.com',
            'TOM': 'TRN1-eu-tom-team@amazon.com'
        },
        "TRN3": {
            'OB': 'trn3-ship-managers@amazon.com',
            'IB': 'trn3-ib-dock-managers@amazon.com',
            'TOM': 'trn3-eu-tom-managers@amazon.com'
        },
        "ULO1":{
            "Team": 'ulo1-team@amazon.com',
            'Supervisors': 'ulo1-supervisors@amazon.com',
            'Managers': 'ulo1-managers@amazon.com',
            'Manager I': 'riazasme@amazon.com',
            'Manager II': 'gsf-escalation-ulo1@amazon.com'
        },
        "UPS": {
            'EUROPE': 'cteuropewwef@ups.com',
            'Escalation': 'fvignati@ups.com, roberto.fiaschi@europe.ups.com',
            'Germany': 'michael.karl@europe.ups.com , akeloglouramisch@ups.com',
            'UK': 'cteuropewwef@ups.com,mkieu@ups.com,russellsemple@ups.com,russellsemple@ups.com',
            'Tamsworth': 'russellsemple@ups.com,nicolaharrison@ups.com,jbrunskill@ups.com,dbraceland@ups.com,carlrobinson@ups.com',
            'BVA': 'cteuropewwef@ups.com, smbobi@ups.com, mchapelain@ups.com, FRA1OXD@europe.ups.com, FRA1LYT@europe.ups.com',
            'LIL1': 'cteuropewwef@ups.com, smbobi@ups.com, mchapelain@ups.com, FRA1OXD@europe.ups.com, FRA1LYT@europe.ups.com',
            'ORY8': 'cteuropewwef@ups.com, smbobi@ups.com, mchapelain@ups.com, FRA1OXD@europe.ups.com, FRA1LYT@europe.ups.com'
        },
        "UPSF": {
            'Traffic': 'upstraffic@ups.com,jdevitt@ups.com,derby-contracts@ups.com,twood@ups.com,amarriott@ups.com,avolodina@ups.com',
            'Escalations': 'kiranegi@amazon.com,saborido@amazon.es',
            'Cancellations': 'sjeffery@ups.com,tparker1@ups.com,acawthra@ups.com,klabourn@ups.com,jordanbooth@ups.com,charlieyoung@ups.com,stephenfox@ups.com,upstraffic@ups.com'
        },
        "UKK1": {
            'Leadership': 'ukk1-leadership@amazon.com'
        },
        "UKK2": {
            'TOM Team': 'ema3-eu-tom-team@amazon.com',
            'TOM Leads': 'ema3-eu-tom-leads@amazon.com',
            'TOM Area Manager': 'baralche@amazon.co.uk'
        },
        "UZR1":{
            'Managers': 'uzr1-managers@amazon.com'
        },
        "VEAK":{
            'OPS': 'veak-ef-ops@amazon.com',
            'Manager I': 'inecueva@amazon.com',
            'Manager II': 'miguezrt@amazon.es'
        },
        "VEBE": {
            'POC 1' : 'smmaack@amazon.de',
            'POC 2' : 'bchts@amazon.de',
            'POC 3' : 'momalaye@amazon.com'
        },
        "VEBJ":{
            'General': 'vebj-operations@amazon.com',
            'Lead': 'cruzsim@amazon.fr',
            'Manager': 'ritchmaa@amazon.com',
            'Control Tower': 'plouvale@amazon.com'
        },
        "VECI": {
            'Outbound': 'veci-leads@amazon.com',
            'Lead': 'hsschlie@amazon.com',
            'Manager':'momalaye@amazon.com'
        },
        "VEEQ": {
            'Master POC 1': 'migufuen@amazon.com',
            'Master POC 2': 'mrespona@amazon.es',
            'Master POC 3' : 'carretea@amazon.com'
        },
        "VEEY": {
            'Yard 1': 'osy-team@amazon.com',
            'Yard 2': 'securitydtm2-3@park-your-truck.com',
            'Master': 'ds@park-your-truck.com'
        },
        "VAD4": {
            'Master': 'vad4-leads@amazon.com',
            'OB': 'mad4-outbound-shipping@amazon.com',
            'IB': 'vad4-leads@amazon.com'
        },
        "VEAD": {
            'Master': 'zieglerv@amazon.com'
        },
        "VEAE":{
            'Manager': 'mrespona@amazon.es',
            'General': 'veae-ef-ops@amazon.com',
            'Operations POC 1': 'gohermin@amazon.com',
            'Operations POC 2': 'mrespona@amazon.es',
            'Operaions POC 3': 'cheyesai@amazon.com',
            'Operations POC 4': 'carretea@amazon.com'
        },
        "VECL": {
            'General 1': 'hpenadri@amazon.com',
            'General 2' : 'brenaf@amazon.com',
            'Master' : 'dllavoie@amazon.es'
        },
        "VEGE": {
            'OB': 'alancha@amazon.com',
            'OB 2': 'andresni@amazon.com',
            'IB': 'alancha@amazon.com',
            'Master': 'grciabk@amazon.com'
        },
        "VEJA": {
            'Team': 'veja-shipping@amazon.com',
            'Master': 'nbbrzezi@amazon.de'
        },
        "VECG":{
            'General': 'vecg-leadership@amazon.com'
        },
        "VECM": {
            'Team': 'lead-vecm@amazon.com',
            'Master': 'khwester@amazon.de'
        },
        "VEVI": {
            'LEADS+MANAGER': 'vevi-shipping@amazon.com',
            'Master': 'momalaye@amazon.com'
        },
        "VECE":{
            "POC": 'retkoios@amazon.com',
        },
        "VEFE": {
            'General': 'vefe-it-superuser@amazon.com',
            'IB POC': 'piemarek@amazon.com',
            'OB POC': 'nowosb@amazon.com',
            'Master POC': 'retkoios@amazon.com'
        },
        "VEFH": {
            'Yard POC': 'blakeymi@amazon.de',
            'Master POC': 'beuerlek@amazon.com'
        },
        "VEOL":{
            'Leads': 'vf-de-veol@amazon.com',
            'Master': 'bpreuss@amazon.com'
        },
        "VEPC": {
            'General': 'vepc-shipping@amazon.com',
            'Master': 'momalaye@amazon.com'
        },
        "VEPD": {
            'General': 'vepd-leadership@amazon.co.uk',
            'Master': 'knalison@amazon.co.uk',
            'IB': 'emcham@amazon.com'
        },
        "VEPK":{
            'General': 'vepk-it-superuser@amazon.com',
            'Master I': 'ezike@amazon.lu',
            'Master II': 'sisilvan@amazon.it'
        },
        "VEMO":{
            'POC': 'mkkwal@amazon.co.uk',
            'Master': 'sufyaanl@amazon.com'
        },
        "VENC": {
            'FMC_CASE': 'venc_fmc@venc.com',
            'General': 'lead-venc@amazon.com'
        },
        "VEGI": {
            'General': 'tutkamil@amazon.com'
        },
        "VEHG": {
            'Master': 'pedleybp@amazon.com',
            'OB POC 1': 'newmanjo@amazon.com',
            'OB POC 2': 'dinugeo@amazon.com',
            'OB POC 3': 'vehg-leadership@amazon.co.uk'
        },
        "VEMS":{
            'Leadership': 'vems-leadership@amazon.com'
        },
        "VEOD": {
            'General': 'veod-leadership@amazon.co.uk'
        },
        "VEPP":{
            'General': 'leads-vepp@amazon.com',
            'Manager I': 'ilsieber@amazon.de',
            'Manager II': 'momalaye@amazon.com'
        },
        "VEQB":{
            'Leads': 'lead-veqb@amazon.com',
            'Manager': 'dornm@amazon.de'
        },
        "VETK": {
            'Team': 'vetk-shipping@amazon.com',
            'Master': 'beuerlek@amazon.com'
        },
        "VETS": {
            'OPS TEAM': 'vets-ef-ops@amazon.com',
            'Master POC 1': 'estebrpa@amazon.com',
            'Master POC 2': 'pssegovi@amazon.com'
        },
        "VEHF": {
            'General': 'vehf-shipping@amazon.com',
            'POC 1': 'kuebrac@amazon.com'
        },
        "VEAG": {
            'VEAG Leadership': 'veag-leadership@amazon.co.uk',
            'Master POC': 'halldori@amazon.com'
        },
        "VEAH": {
            'Lead': 'lead-veah@amazon.com',
            'Master POC': 'svsteger@amazon.de'
        },
        "VEBF": {
            'VEBF Leadership': 'vebf-leadership@amazon.co.uk',
            'Master POC': 'potoniem@amazon.co.uk'
        },
        "VEBG": {
            'Master POC': 'inecueva@amazon.es'
        },
        "VEBH": {
            'General':'vebh-it-superuser@amazon.com',
            'POC 1': 'mpontice@amazon.com',
            'POC 2': 'brionia@amazon.com',
            'POC 3': 'spatarou@amazon.com',
            'Master 1': 'mpontice@amazon.com',
            'Master 2': 'brionia@amazon.com'
        },
        "VEBR":{
            'Leadership': 'vebr-leadership@amazon.com'
        },
        "VECA": {
            'VECA Leadership': 'veca-leadership@amazon.co.uk'
        },
        "VECB": {
            'VECB Leadership': 'vecb-leadership@amazon.co.uk',
            'POC 1': 'steenisz@amazon.com'
        },
        "VECU": {
            'Leaership': 'vecu-leadership@amazon.co.uk'
        },
        "VEEA": {
            'General': 'veea-leadership@amazon.co.uk',
            'Master POC': 'retkoios@amazon.com'
        },
        "VEEI": {
            'General': 'veei-leadership@amazon.co.uk',
            'Master POC': 'poltl@amazon.com'
        },
        "VEEG": {
            'OB': 'veeg-ef-ops@amazon.com',
            'IB': 'veeg-ef-ops@amazon.com',
            'Yard': 'veeg-ef-ops@amazon.com',
            'Master': 'brenaf@amazon.com'
        },
        "VEEO": {
            'General': 'veeo-leadership@amazon.co.uk',
            'Master POC': 'potoniem@amazon.co.uk'
        },
        "VEGJ": {
            'General': 'vegj-leadership@amazon.co.uk',
            'Master POC': 'knalison@amazon.co.uk'
        },
        "VEKA": {
            'General': 'veka-leadership@amazon.co.uk',
            'Master POC': 'potoniem@amazon.co.uk'
        },
        "VEHQ": {
            'OB': 'vehq-outbound@amazon.it',
            'Yard': 'vehq-outbound@amazon.it',
            'Master': 'vehq-outbound@amazon.it'
        },
        "VEHZ": {
            'Master 1': 'andresni@amazon.com',
            'Master 2': 'appernia@amazon.com',
            'Master 3': 'carretea@amazon.com'
        },
        "VELM": {
            'Master': 'wjmm@amazon.co.uk'
        },
        "VELC": {
            'General': 'velc-leadership@amazon.co.uk',
            'POC': 'stuaglen@amazon.co.uk'
        },
        "VELQ": {
            'General': 'lead-velq@amazon.com',
            'Manager': 'manmehrp@amazon.de'
        },
        "VEMF": {
            'Yard': 'heech@amazon.de',
            'Master': 'momalaye@amazon.com'
        },
        "VEOF": {
            'OB': 'veof-shipping@amazon.com',
            'Master': 'wolldeni@amazon.de'
        },
        "VEOR": {
            'POC 1': 'lawrchlo@amazon.co.uk',
            'POC 2': 'pedleybp@amazon.com'
        },
        "VEPG": {
            'General': 'vepg-leadership@amazon.co.uk'
        },
        "VEQG":{
            'General': 'veqg-operations@amazon.com',
            'Lead': 'wthtran@amazon.fr',
            'Manager':'leodw@amazon.fr',
            'Control Tower': 'plouvale@amazon.com',
            'Control Tower 2': 'kasmisa@amazon.fr'
        },
        "VEQP": {
            'ICQA Manager': 'verringad@amazon.com'
        },
        "VERW": {
            'Master': 'closea@amazon.com'
        },
        "VEGM": {
            'Leadership': 'knalison@amazon.co.uk'
        },
        "VEKS ": {
            'OB 1': 'nicolbor@amazon.com',
            'OB 2': 'tdgarci@amazon.com',
            'Operations': 'veks-ef-ops@amazon.com'
        },
        "VEPR ": {
            'General': 'vepr-operations@amazon.com',
            'Manager': 'perrromy@amazon.fr',
            'Lead': 'mbouloug@amazon.fr'
        },
        "VEPX": {
            'Team': 'brenaf@amazon.com, andresni@amazon.com',
            'Master': 'grciabk@amazon.com'
        },
        "VEPY": {
            'General': 'vepy-it-superuser@amazon.com',
            'Master': 'sccecch@amazon.com'
        },
        "VEPZ": {
            'General':'vepz-operations@amazon.com',
            'Manager': 'leodw@amazon.fr',
            'Lead': 'jtenteli@amazon.fr'
        },
        "VEMC": {
            'Master 2': 'carretea@amazon.com',
            'Master 2': 'regueroa@amazon.com',
            'Master 3': 'appernia@amazon.com'
        },
        "VEMU": {
            'Master': 'kjjurczu@amazon.pl'
        },
        "VENG": {
            'General POC 1' : 'gajavi@amazon.com',
            'General POC 2' : 'andresni@amazon.com',
            'Master' : 'alancha@amazon.com'
        },
        "VETL":{
            'POC': 'inecueva@amazon.es'
        },
        "VEOH": {
            'General': 'veoh-it-superuser@amazon.com',
            'Master': 'mognes@amazon.com'
        },
        "VERH": {
            'POC 1': 'gomenoel@amazon.com',
            'POC 2': 'eyerc@amazon.com',
            'POC 3': 'inecueva@amazon.es',
            'POC 4': 'pssegovi@amazon.es'
        },
        "VERZ":{
            'POC 1': 'dllavoie@amazon.com',
            'POC 2': 'falvarfr@amazon.com'
        },
        "VLC1": {
            'TOM': 'vlc1-eu-tom-team@amazon.com',
            'TOM LEADS': 'vlc1-eu-tom-leads@amazon.com',
            'TAM': 'jipab@amazon.es',
            'VLC1 ship AMs': 'vlc1-ship-managers@amazon.com',
            'VLC1 bookings': 'vlc1-bookings@amazon.com',
            'VLC1 IB managers': 'vlc1-inbound-managers@amazon.com'
        },
        "VEBD": {
            'General': 'vebd-operations@amazon.com',
            'Lead' : 'gmapecqu@amazon.com',
            'Area Manager' : 'perrromy@amazon.fr',
            'Control Tower' : 'plouvale@amazon.com'
        },
        "VEBQ": {
            'Area Manager': 'ritchmaa@amazon.com',
            'General': 'vebq-operations@amazon.com',
            'Lead': 'bastosjb@amazon.com',
            'Control Tower': 'plouvale@amazon.com'
        },
        "VECY":{
            'Control Tower 1': 'plouvale@amazon.com',
            'Control Tower 2': 'kasmisa@amazon.fr',
            'POC 1': 'leodw@amazon.com',
            'POC 2': 'pasteurc@amazon.com'
        },
        "VEEM": {
            'General': 'veem-operations@amazon.com',
            'Master POC': 'ritchmaa@amazon.com',
            'Lead': 'lamoudt@amazon.fr'
        },
        "VEFN":{
            'Master': 'perrromy@amazon.com',
            'OB': 'pasteurc@amazon.com'
        },
        "VEPU": {
            'General 1' : 'mognes@amazon.com',
            'General 2' : 'caalissi@amazon.com',
            'General 3' :'rccngr@amazon.it',
            'Master': 'mognes@amazon.com'
        },
        "VEQF":{
            'POC 1': 'fimafahr@amazon.com',
            'POC 2': 'thammer@amazon.com'
        },
        "VENJ":{
            'Lead': 'lead-venj@amazon.com',
            'Master': 'lggharbi@amazon.com'
        },
        "VERX": {
            'Master': 'mpontice@amazon.com, milazzf@amazon.com, gianmars@amazon.com'
        },
        "VEWO": {
            'YARD': 'mrespona@amazon.es',
            'OB1':'appernia@amazon.com',
	        'OB2': 'mrespona@amazon.es',
            'IB': 'mrespona@amazon.es',
            'Master': 'migufuen@amazon.com'
        },
        "VEHV": {
            'OB/IB': 'vicevali@amazon.com',
            'Operations': 'vehv-ef-ops@amazon.com',
            'Master 1': 'dmiravet@amazon.com',
            'Master 2': 'dllavoie@amazon.com'
        },
        "VEIX": {
            'General': 'munteanb@amazon.de',
            'Master': 'retkoios@amazon.com'
        },
        "VEKL": {
            'General': 'vekl-operations@amazon.com',
            'Lead': 'coupryje@amazon.com',
            'Control Tower': 'plouvale@amazon.com',
            'Area manager': 'leodw@amazon.fr'
        },
        "VEKV": {
            'General': 'vekv-it-superuser@amazon.com',
            'OB 1': 'brionia@amazon.com',
            'IB 1': 'luparell@amazon.com',
            'IB 2': 'mpontice@amazon.com'
        },
        "VELF": {
            'General': 'velf-ef-ops@amazon.com',
            'Master POC': 'mrespona@amazon.es'
        },
        "VELF": {
            'General': 'velf-ef-ops@amazon.com',
            'Master POC': 'mrespona@amazon.es'
        },
        "VELH": {
            'General': 'velh-it-superuser@amazon.com',
            'Master POC': 'andzilli@amazon.com'
        },
        "VEPB": {
            'General': 'vepb-shipping@amazon.com',
            'Master 1': 'dckstp@amazon.com',
            'Master 2': 'janstea@amazon.com'
        },
        "VEPW": {
            'General': 'vepw-ef-ops@amazon.com',
            'Inbound': 'rifonico@amazon.com',
            'Master 1': 'rifonico@amazon.es',
            'Master 2': 'alancha@amazon.com'
        },
        "VETT": {
            'OB': 'lead-vett@amazon.com',
            'IB': 'lead-vett@amazon.com',
            'Yard': 'lead-vett@amazon.com',
            'Yasar Yalim': 'yalimy@amazon.de'
        },
        "VEWD": {
            'Yard': 'lead-vewd@amazon.com',
            'OB' : 'lead-vewd@amazon.com',
            'Master': 'roeslerb@amazon.com'
        },
        "VEWJ": {
            'General': 'momalaye@amazon.com'
        },
        "VEWM": {
            'General': 'vewm-operations@amazon.com',
            'Area Manager': 'chadiabb@amazon.fr'
        },
        "XWR4": {
            'OB 1': 'bguzda@id-logistics.com',
            'OB 2': 'lfurman@id-logistics.com',
            'IB 1': 'mmyszywoda@id-logistics.com',
            'IB 2':'mkulikowski@id-logistics.com',
            'Master 1': 'jplesniarski@id-logistics.com',
            'Master 2': 'roczniak@amazon.com',
            'Master 3': 'pisaag@amazon.pl'
        },
        "WRO1": {
            'OB Cases': 'wro1-shipping@amazon.com',
            'OB Operations Manager': 'wro1-outbound-ops@amazon.com',
            'Outbound (Vendor Returns)': 'wro1-vr-manager@amazon.com',
            'CustomerReturns': 'wro1-cret-dock@amazon.com',
            'IB Cases': 'wro1-inbound-leads@amazon.com'
        },
        "WRO2": {
            'OB Cases': 'wro1-shipping@amazon.com',
            'OB Operations Manager': 'wro1-outbound-ops@amazon.com',
            'Outbound (Vendor Returns)': 'wro1-vr-manager@amazon.com',
            'CustomerReturns': 'wro1-cret-dock@amazon.com',
            'IB Cases': 'wro1-inbound-leads@amazon.com'
        },
        "WRO5": {
            'Regional TOM': 'trebusie@amazon.com',
            'TOM Team Leads': 'wro5-eu-tom-leads@amazon.com',
            'TOM Operations Manager': 'rakmicha@amazon.com',
            'OB Cases': 'wro5-shipping-clerks@amazon.com',
            'OB Cases Escalation': 'wro5-shipping-manager@amazon.com',
            'OB OPS': 'wro5-outbound-ops@amazon.com',
            'IB Cases': 'wro5-dock-team@amazon.com',
            'IB Cases Escalation': 'wro5-dock-manager@amazon.com',
            'IB OPS': 'wro5-inbound-ops@amazon.com',
            'Unloading Delays': 'wro5-inbound-ops@amazon.com'
        },
        "XCR2": {
            'OB 1' :'MCLTeamLeaders@maersk.onmicrosoft.com',
            'OB 2' : 'maamar.belesga@maersk.com',
            'OB 3' : 'mathilde.labbe@maersk.com',
            'IB 1' : 'MCLTeamLeaders@maersk.onmicrosoft.com',
            'IB Managers' : 'MCLAreaManagersDL@maersk.onmicrosoft.com',
            'Yard' : 'MCLAreaManagersDL@maersk.onmicrosoft.com',
            'Master' : 'MCLAreaManagersDL@maersk.onmicrosoft.com'
        },
        "XDEA":{
            'Manager': 'gottemei@amazon.de',
            'Master Support': 'xdea-amxl-ops@amazon.com',
            'Master Operations': 'shd-de-kwh-01-leistand@cevalogistics.com',
            'OB/IB': 'xdea-amxl-ops@amazon.com',
            'Operations' :'shd-de-kwh-01-leistand@cevalogistics.com'
        },
        "XDT3": {
            '3PL Ops': 'ob-amzxd-dui@maersk.com',
            '3PL Amazon Ops': 'xdt3-ef-ops@amazon.com',
            'IB Ops': 'ib-amzxd-dui@maersk.com'
        },
        "XESF": {
            'Transportation': 'es-transportation@amazon.com',
            'Escalation POC CEVA': 'david.garzon@cevalogistics.com',
            'Amazon Manager': 'alancha@amazon.com',
            'EF Amazon Team': 'xesf-ef-ops@amazon.com',
            'Area Manager OB': 'daniel.penalver@cevalogistics.com',
            'Admins': 'AnaIsabel.Fernandez@cevalogistics.com, erika.torrejon@cevalogistics.com, Belen.Sanchez@cevalogistics.com',
            'Lead OB': 'alberto.del.nuevo@cevalogistics.com',
            'Area Manager IB': 'cesar.huerta@cevalogistics.com',
            'Lead IB': 'sergio.garcia-esteban@cevalogistics.com'
        },
        "XFR1":{
            'Escalations': 'afflec@amazon.com',
            'OB': 'xdey-outbound@id-logistics.com',
            'Shipping': 'xdey-shipping-ops@id-logistics.com',
            'IB': 'XDEY-Inbound-Booking@id-logistics.com'
        },
        "XFR4": {
            'General': 'smadhok@id-logistics.com',
            'Master 1': 'ktetzner@amazon.com',
            'Master 2' : 'usler@amazon.com'
        },
        "XFRE": {
            'General 1': 'xfre-ef-ops@amazon.com',
            'General 2': 'xfre-chargement@geodis.com',
            'Master': 'geohoche@amazon.com'
        },
        "XFRJ": {
            'AMXL Ops': 'xfrj-amxl-ops@amazon.com',
            'Admin': 'amxl_savigny_admin@id-logistics.com',
            'OPS Lead': 'amxl_savigny_flow@id-logistics.com',
            'XFRJ OPS': 'xfrj_ops@id-logistics.com'
        },
        "XFRN":{
            'Ops': 'xfrn-amxl-ops@amazon.com',
            'Desk': 'xfrn-yard.wemea.st-quentin5@geodis.com',
            'Management': 'direction.wemea.st-quentin5@geodis.com',
            'Manager': 'aswiam@amazon.com'
        },
        "XFRO": {
            'Outbound': 'xfro-outbound@gxo.com',
            'Inbound': 'xfro-inbound@gxo.com',
            'Amazon EF Ops': 'xfro-ef-ops@amazon.com',
            'XFRO Management GXO': 'XFRO-Management@gxo.com',
            'Amazon POC': 'crosa@amazon.com',
        },
        "XFRS ": {
            'OB Ops': 'xfrs-ef-ops@amazon.com',
            'OB Management': 'XFRS-Management@gxo.com',
            'IB Ops': 'xfrs-ef-ops@amazon.com',
            'Management': 'XFRS-Management@gxo.com'
        },
        "XFRZ": {
            'Ops General': 'xfrz-ef-ops@amazon.com',
            'Inbound General': 'xfrz.inbound@cevalogistics.com',
            'Outbound General': 'XFRZ.Outbound@cevalogistics.com',
            '3PL Manager': 'crosa@amazon.com'
        },
        "XBH6": {
            'POC 1': 'Daniel.Nolan@bleckmann.com',
            'POC 2': 'krystof.bogdanovic@bleckmann.com',
            'POC 3': 'andrei.alecsandru@bleckmann.com',
            'POC 4': 'aleksandra.calak@bleckmann.com',
            'Manager 1': 'jakebowd@amazon.co.uk',
            'Manager 2': 'james.taylor-cook@bleckmann.com',
            'Manager 3': 'Daniel.Nolan@bleckmann.com'
        },
        "XFR7":{
            'Genral': 'sreckers@amazon.com',
            'Master': 'bauermax@amazon.de'
        },
        "XGEB": {
            'OB cases': 'xgeb-cases.nece.aurach@geodis.com',
            'Support': 'xgeb-amxl-ops@amazon.com'
        },
        "XITF": {
            'AMXL': 'it-amxl-3pl-ops@amazon.com',
            'OB': 'xitf.outbound.ops@geodis.com',
            'IB MNGR': 'xitf.inbound.ops@geodis.com',
            'Romeo Zade (Amazon)': 'romezade@amazon.it',
            'Fabio Percivalle (Geodis)': 'fabio.percivalle@geodis.com'
        },
        "XITG": {
            'Master 1': 'dario.fabbri@geodis.com',
            'Master 2': 'magluigi@amazon.com',
            'OB/IB Ops': 'xitg-ef-ops@amazon.com',
            'BWS Office 1': 'abi.bws001@geodis.com',
            'BWS Office 2': 'abi.bws002@geodis.com',
        },
        "XIBA": {
            'General': 'xiba-amxl-ops@amazon.com',
            'XIBA IB': 'xibainbound.tor.es.cl@geodis.com',
            'XIBA OPS': 'xibamanagers.tor.es.cl@geodis.com'
        },
        "XITK": {
            'Ops General': 'xitk-ef-ops@amazon.com',
            'Outbound General': 'xitk_outbound@id-logistics.com',
            'Inbound Lead': 'drisoli@amazon.com',
            'Outbound Lead': 'acolacit@amazon.com',
            'Master': 'aaalosi@amazon.com'
        },
        "XITI": {
            'Ops General': 'xiti-ef-ops@amazon.com',
            'Inbound General': 'xiti.inbound.ops@geodis.com',
            'Outbound General': 'xiti.outbound.ops@geodis.com'
        },
        "XOR1": {
            'GXO': 'xor1-management@gxo.com',
            'Lamey Morgane (Amazon)': 'xor1-ef-ops@amazon.com'
        },
        "XOR7": {
            'XOR7 AMXL OPS': 'xor7-amxl-ops@amazon.com',
            'XOR7 3PL OPS': 'xor7_teamleader@id-logistics.com'
        },
        "XOS1": {
            'Amz Operations': 'xfrl-ef-ops@amazon.com',
            '3P OPS': 'operationsxfrl@id-logistics.com',
            'Manager': 'crosa@amazon.com'
        },
        "XTRA": {
            'Outbound': 'DL-SE-TR-Amazon-TR-Shipping@Cevalogistics.com',
            'Inbound': 'DL-SE-TR-Amazon-TR-Bookings@Cevalogistics.com',
            'POC': 'hazalyil@amazon.com.tr',
            'Escalation': 'sezerk@amazon.com.tr',
            'EF Ops': 'xtra-ef-ops@amazon.com'
        },
        "XAM1": {
            'Master': 'frank.hampsink@bleckmann.com'
        },
        "XAR1": {
            'XAR1 Amazon EF team': 'xar1-ef-ops@amazon.com',
            'KN Outbound': 'knekt.outbound@kuehne-nagel.com'
        },
        "XCD1": {
            'Operations': 'xcd1-ef-ops@amazon.com',
            'Team Leader': 'xcd1-teamleader@gxo.com',
            'Yard': 'xcd1-ef-ops@amazon.com',
            'Manager': 'XCD1-Management@gxo.com',
            'Lamey Morgane': 'xcd1-ef-ops@amazon.com'
        },
        "XDR1": {
            'EF OPS': 'xplc-ef-ops@amazon.com',
            'EF Manager': 'ktetzner@amazon.com',
            'EF Specialist': 'saramic@amazon.com',
            'Ship ( leaders+managers)': 'XPLC-OUT@id-logistics.com',
            'Inbound (leaders+managers)': 'XPLC-IN@id-logistics.com'
        },
        "XDE1":{
            'General': 'Avisinbound-SR@ingrammicro.com',
            'Master': 'mrihm@amazon.de'
        },
        "XDEQ": {
            'Shipping Ops': 'xdeq-shipping-ops@id-logistics.com',
            'XDEQ Flow Control': 'xdeq-flowcontrol@id-logistics.com',
            'IB Admin Team': 'xdeq-inbound-admin@id-logistics.com',
            'EF Ops - Amazon POC team': 'xdeq-ef-ops@amazon.com',
            'Escalation': 'afflec@amazon.com'
        },
        "XDEO": {
            'XDEO Outbound': 'xdeo.outbound@cevalogistics.com',
            'XDEO Inbound': 'xdeo.inbound@cevalogistics.com',
            '3PL Master POC': 'marcus.blair@cevalogistics.com',
            'Amazon Master POC': 'ktetzner@amazon.com'
        },
        "XDEZ": {
            'Clerk': 'AdminClerk01.CL.OBH@geodis.com',
            'OB Admins': 'XDEZ-outbound.cl.obh@geodis.com',
            'XDEZ Admins': 'TeamAdmin.CL.OBH@geodis.com',
            'Escalation': 'isteilen@amazon.com'
        },
        "XMA8":{
            'POC 1': 'jaime.alarcon@geodis.com',
            'POC 2': 'david.alonso@geodis.com',
            'POC 3': 'ismael.palancar@geodis.com',
            'YARD': 'xma8-amxl-ops@amazon.com'
        },
        "XWR3": {
            'Dock 1': 'dock_adm_pi1@id-logistics.com',
            'Dock 2': 'dock_adm_pi2@id-logistics.com',
            'Dock MNG': 'agdowska@id-logistics.com',
            'OB Managers': 'XPLE-Outbound@id-logistics.com',
            'IB Managers': 'XPLE-IBdock@id-logistics.com'
        },
        "XDEV": {
            'OB lead': 'xdev-teamleader-outb@id-logistics.com',
            'OB Area Manager': 'xdev-outbound@id-logistics.com',
            'IB admin': 'XDEV-Inbound-Admin@id-logistics.com',
            'IB lead': 'XDEV-Teamleader-Inbo@id-logistics.com',
            'XDEV Support': 'xdev-amxl-ops@amazon.com'
        },
        "XDT1": {
            'Dock XDT1': 'dock-xdt1@amazon.com',
            'OB Area Manager': 'dock-xdt1@syncreon.com',
            'Hussein Ismail': 'husseini@amazon.com'
        },
        "XPLB": {
            'Ops General': 'xplb-ef-ops@amazon.com',
            'Master': 'pisaag@amazon.pl',
            'TOM Leads': 'lukasz.banasiak@cevalogistics.com',
            'Outbound Leads': 'gracjan.konieczny@cevalogistics.com',
            'Inbound Leads': 'Liliia.Kurlishchuk@cevalogistics.com'
        },
        "XPLC": {
            'EF OPS': 'xplc-ef-ops@amazon.com',
            'EF Manager': 'ktetzner@amazon.com',
            'EF Specialist': 'saramic@amazon.com',
            'Ship ( leaders+managers)': 'XPLC-OUT@id-logistics.com',
            'Outbound Team': 'outbound_adm_zgo1@id-logistics.com',
            'Inbound (leaders+managers)': 'XPLC-IN@id-logistics.com'
        },
        "XPO1": {
            'EF OPS': 'xpo1-ef-ops@amazon.com',
            'EF Manager': 'matyldan@amazon.pl',
            'EF Specialist': 'roczniak@amazon.com',
            'Ship Managers': 'XPLD-Lead_OUT@id-logistics.com',
            'IB managers': 'XPLD-Inbound@id-logistics.com',
            'IB Administration': 'inbound_adm_ro@id-logistics.com'
        },
        "XPLA": {
            'Outbound Admin Wro': 'outbound_adm_wro@id-logistics.com',
            'Outbound site': 'ship-lider@id-logistics.com',
            'Site Ops Manager': 'jplesniarski@id-logistics.com',
            'EF Manager': 'alqumahe@amazon.it',
            'EF Specialist': 'roczniak@amazon.com'
        },
        "XTRD": {
            'EF Ops': 'xtrd-ef-ops@amazon.com',
            'POC': 'arslakug@amazon.com.tr'
        },
        "XSA8": {
            'Deniz Kansin Gok': 'dkansin@amazon.com.tr'
        },
        "XCG3": {
            'Sébastien Gambin': 'gambin@amazon.com'
        },
        "XBH7": {
            'Operations': 'xbh7-ef-ops@amazon.com',
            'Therese Karlsson': 'thereska@amazon.co.uk',
            'Warehouse Admin': 'GBBUR1Amazon.Admin@bleckmann.com',
            'Operations': 'richard.sadler@bleckmann.com',
            'Tony Huckerby': 'tony.huckerby@bleckmann.com'
        },
        "XBH8": {
            'Gareth Francis': 'fgareth@amazon.com'
        },
        "XITC ": {
            'OB Shipping': 'xitc.shipping.ops@geodis.com',
            'Dario Fabri': 'dario.fabbri@geodis.com',
            'Francesco Mercurio': 'francesco.mercrurio@geodis.com',
            'IB OPS': 'xitg-ef-ops@amazon.com',
            'OPS XITC': 'xitc.inbound.ops@geodis.com',
            'Luigi Maglione': 'magluigi@amazon.com'
        },
        "XOR4": {
            'General': 'uferon@id-logistics.com',
            '3PL OPS': 'xor4-ef-ops@amazon.com',
            'EPL Manager': 'essalou@amazon.fr'
        },
        "XLP1":{
            'OB': 'xlp1-ef-ops@amazon.com',
            '3PL': 'deeside.dawsnrmanagement@greatbear.co.uk',
            'IB': 'xlp1-ef-ops@amazon.com',
            'Manager': 'pahop@amazon.co.uk'
        },
        "XUKA": {
            'OB': 'dhl.uk.prestonbrook@dhl.com',
            'Richard Roberts': 'Richard.Roberts@dhl.com',
            'IB': 'dhl.uk.prestonbrook@dhl.com',
            'Neil Stubbs': 'neil.stubbs2@dhl.com',
            'Master': 'xuka-amxl-ops@amazon.com',
            'DHL UK': 'dhl.uk.prestonbrook@dhl.com'
        },
        "XUKC": {
            'OB' : 'xukc-leadership@amazon.co.uk',
            'IB' : 'damiaf@amazon.com'
         },
        "XUKO": {
            'Operations': 'xuko-ef-ops@amazon.com',
            'IB Ops': 'xuko-ef-ops@amazon.com',
            'Connor Thorpe': 'connor.thorpe@geodis.com',
            'Owen Hill': 'owen.hill@geodis.com'
         },
        "XUKS": {
            'Operations': 'xuks-amxl-ops@amazon.com',
            '3PL specialist': 'bartoabi@amazon.com',
            '3PL specialist 2': 'laveric@amazon.com',
            'Manager': 'wollamt@amazon.co.uk'
        },
        "YMAD":{
            'OSY Team': 'osy-team@amazon.com',
            'Manager I': 'ghislain.rossignol@tgfsl.com',
            'Manager II': 'amazon@tgfsl.com',
            'Manager III': 'federico.solana@tgfsl.com'
        },
        "YWRO": {
            'OSY Team': 'osy-team@amazon.com',
            'Manager I': 'p.paczek@m2c.eu',
            'Manager II': 's.chebli@m2c.eu'
         },
        "ZAZ1": {
        'OB Cases': 'zaz1-ship@amazon.com',
        'Escalation': 'zaz1-ship-managers@amazon.com',
        'IB Dock': 'zaz1-ib-dock@amazon.com',
        'IB Lead': 'zaz1-ib-lead@amazon.com',
        'TOM': 'imclopes@amazon.com',
        'IB/OB SOM': 'palajaim@amazon.es',
        'Regional TOM': 'gaadavid@amazon.es'
         }
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
                },
                "Missing Drop": {
                    "Commercial carrier confirmed that they can not provide drop": [
                        "Modify the equipment type from DROP to DETACHED. \nAnticipate the SAT by 0.5 hours and change the loading type to \u201cLive\u201d.\nUpdate and close the case. ",
                        "Hello Carrier,\n The trailer has been not dropped at least 12 hours in advance as per procedure and trailer cannot be preloaded as planned. For this reason, please arrive with your own trailer.\nVRID has been updated with the below details:\n\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0 New SAT:\nEquipment type: DETACHED_TRAILER \nClosing case"
                     ]
                },
                "Request to change equipment type": {
                    "Carrier request to change equipment type": [
                        "If Carrier can't perform with scheduled equipment, they need to reject the run via Relay.",
			            ""
                     ]
                },
                "Carrier reporting lack of ATS Prime Trailers": {
                    "Carrier reporting lack of ATS Prime Trailers": [
                        "Check for duplicated topic from Site. \nIf found -> close duplicated case. \nIf Site input not found -> Loop in Origin site for feedback, and upon confirmation continue as 'Site reporting lack of empty trailers'",
			            "Hello ,\n"
                   ],
                },
                "Site lost Carrier's safety equipment": {
                    "": [
                        "",
                        ""
                    ]
                }
            },
            "Equipment: Request from Site": {
                "Early Drop":{
                    "Early drop - 12-15 hrs to SAT":[
                        "Paste the blurb and resolve the case" ,
                        "Dear Site,\nPlease note that ROC addresses early drop requests raised >15 hrs to scheduled time.\nAny requests raised within 12-15 hours prior to SAT will be resolved. If there is no drop provided within 12 hours to SAT, kindly raise a <<Missing Drop>> case for further action.\nThank you."
                    ],
                    "Early drop - Carrier agreed":[
                        "Inform the site regarding carrier ETA and request to raise a missing drop carrier if the trailer is not dropped when SAT is <12 hrs",
                        "[remove the 🔴]\nDear site,\nThe carrier has provided the ETA to drop as 🔴XX hrs. Kindly raise a <<Missing Drop>> case <12 hrs to SAT if trailer is not dropped.\nThank you.",
                    ],
                    "Early drop - Changed ET":[
                        "Paste the blurb and resolve the case",
                        "Dear Carrier,\nAs per the requirements, the trailer should be dropped between 24–12 hours prior to SAT. Since the provided ETA is less than 12 hours before SAT, the equipment type has been changed to DETACHED_TRAILER, and the SAT has been advanced accordingly. Please ensure that you arrive with your own trailer. The VRID has been updated with the following details:\nNew SAT:\nEquipment Type: DETACHED_TRAILER\nPlease be informed that not dropping the trailer at least 12 hours in advance to the SAT will have a negative impact on the RPS.\Thank you."
                    ],
                    "Early drop - DB - Unresponsive":[
                        "Loop in the carrier and request for the update regarding trailer drop and driving Ban, follow up with the carrier till two snoozes if still carrier is unresponsive, update the correspondence and close the case.",
                        "Dear Site,\nROC has followed up twice with carrier to check for the drop feasibility before the driving ban starts, but we have not received a response from the carrier.\nKindly raise a 'Missing Drop' case if the trailer is not dropped within 12 hours to SAT.\nThank you."
                    ],
                    "Early drop - Carrier Unresponsive":[
                        "Loop in the carrier and request for the update regarding trailer drop, follow up with the carrier till two snoozes if still carrier is unresponsive, update the correspondence and close the case",
                        "Dear Site,\nROC has followed up twice with carrier to check for the drop feasibility as per expected early drop time, but we have not received a response from the carrier.\nKindly raise a 'Missing Drop' case if the trailer is not dropped within 12 hours to SAT.\nThank you."
                    ],
                    "Early drop - No expected early drop time":[
                        "Paste the blurb and resolve the case",
                        "Dear site,\nPlease note that ROC addresses early drop requests raised more than 15 hours before the scheduled time with expected early drop time.\nAs there is no input regarding the early drop  time, resolving the case.\nPlease create a new case if you still require an  early drop, following the correct template.\n\nYou can find instructions to download FMC tool to guide you to the right template in a few seconds at this link: https://axzile.corp.amazon.com/-/carthamus/script/fmc-case-tool"
                    ],
                },
                "Drop Refusal":{
                    "Drop Refusal - Site cannot preload - Changed ET":[
                        "Loop in carrier and inform ET has been updated to detached and resolve the case",
                        "Dear carrier,\nThe site cannot preload the trailer so we have updated the equipment type to DETACHED_TRAILER. Requesting to please come with your own trailer at SAT [Updated SAT].\nThank you."
                    ],
                    "Drop Refusal - >24 hrs to SAT":[
                        "Paste the blurb and resolve the case",
                        "Dear Carrier,\nplease be informed the trailer must be dropped only between 24 to 12 hours prior to SAT.\Thank you"
                    ],
                    "Drop Refusal - GPS proof provided":[
                        "If driver is tracking at site as per GPS Change equipment type to Detached_trailer and advance SAT by 0.5 hrs.\nFollow loading time guidelines as per shipper account and type of load.",
                        "Dear carrier,\nas site cannot accept the trailer, we have changed the equipment type to detached_trailer and advanced the SAT, requesting to please inform driver to come with trailer as per scheduled time.\nThank you."
                    ],
                    "Drop Refusal - GPS proof not provided":[
                       "Request the carrier to provide GPS proof to confirm the driver’s location and snooze the case for 1 hr.\nFollow up for two snoozes and if still carrier has not responded, change equipment type to Detached_trailer and advance SAT by 0.5 hrs.\nFollow loading time guidelines as per shipper account and type of load.",
                       "Dear carrier,\nas site cannot accept the trailer, we have changed the equipment type to detached_trailer and advanced the SAT, requesting to please inform driver to come with trailer as per scheduled time.\nThank you"
                    ]
                },
                "Incorrect Equipment Type": {
                    "Incorrect ET - Rejection and Replacement Required":[
                        "Raise a replacement bid and cancel the original VRID with the reason code “Incorrect equipment type”.\nLoop the carrier in the case.\nUpdate and close the case.",
                        "Dear Carrier,\nPlease be informed that the truck has been rejected due to incorrect equipment type provided\nEquipment requested: XXXXXXX\nEquipment provided/issue: XXXXXXX\n\nDear Site,\nKind reminder that pictures are mandatory for better visibility about the rejection.\n\nReplacement bid raised: Tp-XXXXXX"
                    ],
                    "Incorrect ET - Extra bid created":[
                        "Raise a bid and resolve the case  if pictures are attached.\nIf there are no pictures attached, inform site to update the pictures.\nSnooze the case for 1 hour.",
                        "Dear Carrier,\nwe have been informed by the site that the equipment used for the recent run does not meet equipment requirements.\nKindly refrain from using incorrect equipment for future runs to ensure adherence to regulations and avoid any potential issues.\Thank you"
                    ],
                    "Incorrect ET – No replacement required":[
                        "If site has attached the pictures and utilizing the VRID:\n-Resolve the case and if site didn’t attach pictures and utilizing the VRID.\n-CC site and request for pictures and snooze the case for 1 hr",
                        "Dear Carrier,\nwe have been informed by the site that the equipment used for the recent run does not meet equipment requirements.\nKindly refrain from using incorrect equipment for future runs to ensure adherence to regulations and avoid any potential issues.\nThank you"
                    ],
                    "Incorrect ET – Replacement created":[
                        "Raise a replacement bid as detached_trailer and follow loading time guidelines.\nCancel Original VRID under “Incorrect Equipment Type” cancellation code.",
                        "[If pictures attached:]\nDear Site,\nreplacement for the incorrect equipment (Bid: xxxxxxx) has been initiated.\nThank you"
                    ],
                    "Incorrect ET – No pictures attached":[
                        "Raise a replacement bid as detached_trailer and follow loading time guidelines.\nCancel Original VRID under “Incorrect Equipment Type” cancellation code.",
                        "Dear Site,\nreplacement for the incorrect equipment (Bid: xxxxxxx) has been initiated.\nKindly attach the pictures of the equipment in question so we can update the carrier.\nThank you"
                    ],
                    "Incorrect ET – cancelled":[
                        "Paste Blurb",
                        "Dear Carrier,\nwe have been informed by the site that the equipment used for the recent run does not meet compliance standards.\nKindly refrain from using non-compliant equipment for future runs to ensure adherence to regulations and avoid any potential issues.\nThank you"
                    ]
                },
                "Missing Drop": {
                    "Missing Drop - VRID part of a TOUR": [
                        "Push back, use blurb and close the case",
                        "Hello Site,\nPlease note that the VRID is part of a TOUR and you need to preload an ATSEU. No drop trailer is expected. \nClosing case"
                    ],
                    "Missing drop - ETA for drop provided":[
                        "Loop in the site/carrier and update the correspondence and close the case",
                        "[remove the 🔴]\nDear site,\ncarrier has provided the ETA to drop as 🔴XX hrs which is before the mentioned threshold drop time.\nIf carrier has not dropped the trailer as per said ETA, kindly raise another case."
                    ],
                    "Missing drop - Carrier cannot provide drop trailer before threshold":[
                        "Paste the Blurb and update FMC accordingly",
                        "Dear Carrier,\n\nAs per the requirements, the trailer should be dropped between 24–12 hours prior to scheduled time.\nSince the provided ETA or current time is less than 12 hours to scheduled time and mentioned threshold drop time, the equipment type has been changed to DETACHED_TRAILER, SAT has been advanced accordingly.\nPlease ensure that you arrive with your own trailer.\nThe VRID has been updated with the following details:\nNew SAT:\nEquipment Type: DETACHED_TRAILER\nPlease be informed that not dropping the trailer at least 12 hours in advance to the SAT will have negative impact on the drop trailer compliance.\n\nThank you"
                    ],
                    "Missing Drop - Carrier Unresponsive. Change Equipment Type": [
                        "Loop in the carrier/site and change equipment type.\nAdvance SAT as per loading time guidelines and resolve the case",
                        "Dear Carrier,\nAs per the requirements, the trailer should be dropped between 24–12 hours prior to SAT. Since there is no update regarding the drop time from your end, the equipment type has been changed to DETACHED_TRAILER, and the SAT has been advanced accordingly.\nPlease ensure that you arrive with your own trailer. The VRID has been updated with the following details: \nNew SAT: \nEquipment Type: DETACHED_TRAILER\Please be informed that not dropping the trailer at least 12 hours in advance to the SAT will have negative impact on the drop trailer compliance.\n\n**Note:** Dear site, we have followed up twice with the carrier to accommodate the drop as per threshold drop provided. Unfortunately, owing to no response from carrier we have changed the equipment type to detached trailer. Resolving case"
                    ],
                    "Missing Drop - 12-6 hrs to SAT, No threshold":[
                       "If no threshold time is provided Consider threshold time as SAT – 6 hrs, loop in the carrier and request for the ETA on trailer drop",
                       "[remove the 🔴]\nDear Carrier\nAs per the requirement, drop should be provided at least 12 hrs before SAT. However, since the current time is <12 hrs to SAT, the site has updated they can still accept the drop if you can provide the trailer before 🔴XX hrs.\nkindly update the ETA for drop.\nPlease do drop the trailer at the earliest possible to avoid any impact to your drop trailer compliance score.\nThanks"
                    ],
                    "Missing drop - Trailer available as per YMS":[
                        "Paste the blurb and resolve the case",
                        "Dear Site, \nThe trailer number XXXX is available as per YMS. Kindly proceed with utilizing the trailer to load the freight.\nThank you"
                    ]
                },
                "Non Compliant drop":{
                    "Non Compliant drop – No replacement required":[
                        "If site has attached the pictures and utilizing the VRID, resolve the case and if site didn’t attach pictures and utilizing the VRID, cc site and request for pictures and snooze the case for 1 hr",
                        "Dear Carrier,\nwe have been informed by the site that the equipment used for the recent run does not meet compliance standards.\nKindly refrain from using non-compliant equipment for future runs to ensure adherence to regulations and avoid any potential issues.\nThank you"
                    ],
                    "Non Compliant drop – Replacement created":[
                        "Raise a replacement bid as Detached_Trailer and follow loading time guidelines. Cancel Original VRID under “Incorrect Equipment Type” cancellation code.",
                        "[If pictures attached:]\nDear Site, replacement for the incorrect equipment (Bid: xxxxxxx) has been initiated.\nThank you"
                    ],
                    "Non Compliant drop – No pictures attached":[
                        "Raise a replacement bid as Detached_Trailer and follow loading time guidelines.\nCancel Original VRID under “Incorrect Equipment Type” cancellation code.",
                        "Dear Site,\nreplacement for the incorrect equipment (Bid: xxxxxxx) has been initiated.\nKindly attach the pictures of the equipment in question so we can update the carrier.\nThank you"
                    ],
                    "Non Compliant drop – cancelled":[
                        "If site has attached the pictures and utilizing the VRID:\n-Resolve the case and if site didn’t attach pictures and utilizing the VRID\n-CC site and request for pictures and snooze the case for 1 hrs",
                        "Dear Carrier,\nwe have been informed by the site that the equipment used for the recent run does not meet compliance standards.\nKindly refrain from using non-compliant equipment for future runs to ensure adherence to regulations and avoid any potential issues.\nThank you"
                    ]
                },
                "Request to change equipment type": {
                    "Request to change equipment type": [
                        "Case raised by Site informing they won't be able to preload the trailer. \n\nUpdate the original VRID from DROP to DETACHED for the same carrier, anticipating the loading time by 30 minutes and updating the loading type to \u201cLive\u201d. \nLoop the carrier, paste blurb and close the case.\u00a0",
                        "Hello Carrier,\nPlease be informed that the site won\u2019t be able to preload the trailer in advance. Please arrived with your own trailer. \nNew SAT:\nEquipment type: DETACHED_TRAILER\nPlease reopen the case if you are not able to cover the load with a DETACHED so we can find a replacement. "
                    ]
                },
                "Trailer Pick up": {
                    "Trailer Pick up": [
                        "Loop carrier asking ETA to remove the trailer from site",
                        "Hello Carrier, \nSee FC message below and please provide ETA to remove the trailer ASAP\n Hello Site, please confirm when issue is solved"
                    ]
                },
                "Trailer Non Compliant - wet, with holes, not empty": {
                    "Trailer non-compliant/ damaged - Wet, with holes, not empty": [
                        "1. Raise replacement bid\n 2. Cancel original\u00a0VRID\u00a0as\u00a0Incorrect Equipment Type\n3. Add carrier to\u00a0CC\u00a0+ paste blurb",
                        "Hello Carrier,\u00a0\nPlease be aware that the truck presented is a non-compliant Vehicle, kindly be informed your vehicle has been rejected.\u00a0\nPlease take the proper actions to prevent this type of incident from happening again in our facilities.\n\u00a0\n@Site,\nBid has been raised xxxxxxx to secure the load.\nThank you."
                    ]
                },
                "Site reporting lack of empty trailers": {
                    "Bobtail Updated": [
                        "Check tour if next VRID is live load.\nIf yes:_ raise a bid of this next load and reconnect the tour. Update the case VRID to bobtail, paste the blurb <<tour reconnected>> and close the case\nIf not:_ Update case VRID to bobtail, paste blurb <<bobtail updated>> and close the case ",
                        "Hello Site,\nROC team does not update VRIDs to <<bobtail>>. The correct process to request a bobtail movement is following the next link for RIVER: https://tiny.amazon.com/kvnor0nq/riveamaz. \nAlso, you will find the Wiki: https://w.amazon.com/bin/view/ROC_EU/FC_SC_Handbook/Trailerpool/ , with the steps to follow. \nClosing case."
                    ]
                }
            }
        },
        "SAFETY": {
            "Safety: Request from Carrier": {
                "Road Accident": {
                    "ARC Intake Form Sharing": [
                        "If there are no previous actions taken and no relevant cases located (new case)- validate if the case contains the required information to complete an ARC Accident Intake form:\n\nLink: https://eulogistics.arcclaimsportal.com/AMZCarrierIntake/amazonintakelogin",
                        "Hello Carrier, \nThank you for sharing the relevant details.\nThe accident has now been reported to ARC. Please note your ARC Accident number \u2013 AZXXXXXX.\nIn case of any change to circumstances please update the case and ROC will take necessary actions if needed. \nCase closed"
                    ],
                    "No risk to life confirmed": [
                        "Paste the Blurb.\nCC already added.\nRaise ARC once information has been provided or +2h from the first touch from ROC:\n\nhttps://eulogistics.arcclaimsportal.com/AMZCarrierIntake/amazonintakelogin",
                        "Hello Carrier, \nWe are very sorry to hear about the accident and we sincerely hope that the driver/drivers is/are safe. In order to provide you with the best support, kindly provide the following information:\n1 SCAC:\n2 VRID: \n3 Date of Incident DD/MM/YYYY \n4   Time of Incident: HH:MM 24h\n5 Where did the incident occur (address with Global Positioning System (GPS) location): \n6  Description of the incident: \n-Provide a description of the event (Provide a Detailed Description including: What actions/activities led up to the event, what happening during, and what happened after the event took place. Include details on the conditions (weather, physical, etc.) who/what was there (animals, people, vehicles, objects, etc.)\n7 Was there anything or anyone else involved? (Community member, customer, other (animal/insect), other (provide description)\n8  Where there any injuries?\nIf yes, who was injured?  (Driver, co-driver, Community Member, customer, other (animal), other (please specify)\n9  What was the injury?\n10  Did anyone leave the scene in an ambulance?\n11  If yes, who was taken to the hospital? (Driver, Community Member, customer, other – please specify?\n12  Was there any confirmed fatalities?\n13  Was emergency services contacted?\n14  Was there any damage?\n     If yes, what was damaged (i.e. Amazon truck, Amazon trailer, 3PL truck or trailer, other vehicles, other(please specify)TrailerPoolAdjustment (TPA)\n15  Was the trailer/truck Amazon branded?\n16  Was the trailer loaded or not?\n \nPlease provide the above details as soon as possible in order for ROC to proceed with Accident Reporting to ARC.\nIf you have reported the ARC Accident via phone \u2013 please provide the ARC Accident Number for our Record."
                    ],
                    "Fatality confirmed": [
                        "Share Blurb \nRaise ARC once information has been provided or +2h from the first touch from ROC:\n\nhttps://eulogistics.arcclaimsportal.com/AMZCarrierIntake/amazonintakelogin",
                        "Hello Carrier, \nPlease accept our deepest condolences for your loss and our sympathies for the driver/driver's family. As you going through this difficult time, we will do our best to ensure the best support is provided.\nKindly provide the following information:\n1 SCAC:\n2 VRID: \n3 Date of Incident DD/MM/YYYY \n4   Time of Incident: HH:MM 24h\n5 Where did the incident occur (address with Global Positioning System (GPS) location): \n6  Description of the incident: \n-Provide a description of the event (Provide a Detailed Description including: What actions/activities led up to the event, what happening during, and what happened after the event took place. Include details on the conditions (weather, physical, etc.) who/what was there (animals, people, vehicles, objects, etc.)\n7 Was there anything or anyone else involved? (Community member, customer, other (animal/insect), other (provide description)\n8  Where there any injuries?\nIf yes, who was injured?  (Driver, co-driver, Community Member, customer, other (animal), other (please specify)\n9  What was the injury?\n10  Did anyone leave the scene in an ambulance?\n11  If yes, who was taken to the hospital? (Driver, Community Member, customer, other – please specify?\n12  Was there any confirmed fatalities?\n13  Was emergency services contacted?\n14  Was there any damage?\n     If yes, what was damaged (i.e. Amazon truck, Amazon trailer, 3PL truck or trailer, other vehicles, other(please specify)TrailerPoolAdjustment (TPA)\n15  Was the trailer/truck Amazon branded?\n16  Was the trailer loaded or not?\n \n\n \nPlease provide the above details as soon as possible in order for ROC to proceed with Accident Reporting to ARC.\nIf you have reported the ARC Accident via phone \u2013 please provide the ARC Accident Number for our Record."
                    ]
                },
                "Yard Accident - Trailer Damage": {
                    "3P Trailer Damaged": [
                        "",
                        "Dear Carrier, \nThank you for contacting us. A new process to report trailer damage has been created and it won't be necessary to open a case with us to get your claim registered. To report a damage, ensure that you and your driver always follow the below steps: \n1. Ensure that your driver reported immediately to Amazon site leadership and take pictures before driver leaves Amazon premises. Driver will receive a claim reference ID, which confirms that the incident has been reported and registered. \n2. If driver doesn’t receive the claim reference ID, reach to Carrier Management team by using Relay Carrier Support (RCS) tool.\n\nIf you need to access RCS, please click '?' on the upper right-hand corner of any page in Relay. Get a side menu open, select 'Load execution'; choose the option 'Drivers and vehicles' and select the most applicable common issue."
                    ]
                },
                "Unsafe Loading from Origin": {
                    "Bad Loading Issues Amazon Site": [
                        "Check for duplicated topic from Site.\nIf found -> close duplicated case.\nIf Site input not found -> loop in Site to request feedback, upon confirmation continue as 'Safety: Request from Site / Unsafe Loading from Origin'\n\nAmazon Site to Amazon Site VRID \nBad Loading issue reported by Amazon Sites for trucks coming from Amazon Sites, are outside of ROC scope.\nWhen you receive this type of case, proceed to close it with following blurb:",
                        "Hello Site\nPlease be informed that the correct Process to report such incidents is via Austin and not via Cases, for further guidance please\nrefer to the following link: https://w.amazon.com/bin/view/EUCF_Unsafe_loaded_truck_SOP\nThank you\n-Case Closed-"
                    ],
                    "Bad Loading Issues 3PL Site": [
                        "Check for duplicated topic from Site.\nIf found -> close duplicated case.\nIf Site input not found -> loop in Site to request feedback, upon confirmation continue as 'Safety: Request from Site / Unsafe Loading from Origin'\n\nAmazon site to 3PL site or 3PL site to Amazon Site\nWhenever a case for bad/unsafe loading is opened for a VRID that has a 3PL site involved (either Origin or Destination), follow below steps:\nInclude Origin site in the case and inform them of bad/unsafe load \nRequest destination site to unload the truck if safe to do so\nIf Destination site agrees to unload the truck, annotate it and close the case\nIf Destination site refuses to unload the truck, inform lead/manager on shift about the situation. Lead/Manager on shift will investigate and provide update on next steps",
                        "Hello [Origin Station],\nDestination warehouse is reporting an unsafe loading which is affecting their unloading. Please notice below comments and provide your feedback."
                    ]
                }
            },
            "Safety: Request from Site": {
                "Driver Behavior Issue": {
                    "Driver Behavior Issue": [
                        "Paste the blurb and close the case",
                        "Hello Site,\n\nPlease be informed that the correct Process to report such incidents is via SIM, please follow this link so the corresponding team can work on your request of coaching/ Banning Delivery Associate:\n\nSIM: https://river.amazon.com/LHR16/workflows?buildingType=ats&workflowId=undefined&q0=b28e88c4-6ced-4de3-a155-31627107e866&q1=0b97954e-dfff-495b-936d-723f4ee696df&q2=6c12899f-23b5-4d5c-8e37-7090795ffd1a&id=6c12899f-23b5-4d5c-8e37-7090795ffd1a \n\n Case closed.\n\n\nDo you want a faster case resolution, download FMC Tool tampermonkey script to have 40% quicker case resolution!\nhttps://w.amazon.com/bin/view/Users/fmcasetool/"
                    ]
                },
                "Non-Compliant Case- Missing Information - *QUANTITY*": {
                    "Missing safety equipment - Missing Information": [
                        "Snooze for 1h with the blurb and close it if after it the information missing has not been provided",
                        "Dear Site,\nKindly be informed this case was raised incorrectly, please check if all of the following requirements are met and provide response within next 1 hour.\n- Picture: the picture must clearly show the lack of restraints. {MOST IMPORTANT}:\n- QUANTITY of issued restraints:\n- Origin Node (necessary if not using FMC tool):\n- Number of load restraints issued:\n- Type of restraints issued:\nYour prompt feedback is highly appreciated, \nThank you"
                    ]
                },
                "Non-Compliant Eq. - No Charge Back": {
                    "Missing safety equipment - Informative cases - from Origin": [
                        "Paste the blurb and close the case",
                        "Dear Site,\nPlease be informed that the correct Process to report the non-compliance is via GTDR/LQ360.\n\nIf the tool is not available at your site, please report to your WHS POC.\n\nThank you"
                    ]
                },
                "Non-Compliant Eq. - ONLY CHARGE BACK - *QUANTITY*": {
                    "Missing safety equipment - Issued straps Charge back-": [
                        "Paste the blurb and close the case",
                        "Dear carrier,\nPlease be aware that as per T&C's XX number of restraints have been added to the below vehicle and additional charges will be levied.\nResolving the case."
                    ]
                },
                "Trailer Rejection - Driver refusing the straps or to secure the load": {
                    "Trailer Rejection - Driver refusing the straps or to secure the load": [
                        "Paste the blurb and close the case",
                        "Dear carrier,\nPlease be aware that the truck presented was lacking in safety equipment, as the driver has rejected Amazon's restraints.\nKindly be informed that your vehicle has been rejected. Please take the proper actions to prevent this type of incident from happening again in our facilities.\nThank you "
                    ]
                },
                "Trailer Rejection - No Straps Available at Site": {
                    "Missing safety equipment - Truck Rejection -": [
                        "Paste the blurb and close the case",
                        "Dear Carrier,\nPlease be aware that the truck presented was lacking enough Amazon compliant load restraints.\nKindly be informed your vehicle has been rejected. Please take the proper actions to prevent this type of incident from happening again in our facilities.\nThank you."
                    ]
                },
                "Trailer Rejection - No Pictures attached":{
                    "Missing Safety Equipment - Truck Rejected & No Pictures":[
                        "Snooze for 1h with the blurb and close it if after it the information missing has not been provided",
                        "Dear Site,\nPlease share images of the non-compliant restraints.\nThe images should clearly show the lack of restraints or indicate the restraints are non-compliant.\n\nThank you"
                    ]
                },
                "Unsafe Loading from Origin": {
                    "Bad Loading Issues Amazon Site": [
                        "Amazon Site to Amazon Site VRID\nBad Loading issue reported by Amazon Sites for trucks coming from Amazon Sites, are outside of ROC scope. When you receive this type of case, proceed to close it with following blurb:",
                        "Hello Site\nPlease be informed that the correct Process to report such incidents is via Austin and not via Cases, for further guidance please\nrefer to the following link: https://w.amazon.com/bin/view/EUCF_Unsafe_loaded_truck_SOP\nThank you\n-Case Closed-"
                    ],
                    "Bad Loading Issues 3PL Site": [
                        "Amazon site to 3PL site or 3PL site to Amazon Site\nWhenever a case for bad/unsafe loading is opened for a VRID that has a 3PL site involved (either Origin or Destination), follow below steps:\nInclude Origin site in the case and inform them of bad/unsafe load \nRequest destination site to unload the truck if safe to do so\nIf Destination site agrees to unload the truck, annotate it and close the case\nIf Destination site refuses to unload the truck, inform lead/manager on shift about the situation. Lead/Manager on shift will investigate and provide update on next steps",
                        "Hello ,"
                    ]
                },
                "Yard Accident": {
                    "Yard Accident": [
                        "Review if ARC report is required and share blurb",
                        "Hello Site,\nCan you please confirm, whether the below accident has been reported in Austin or ARC?\nThank you\n\n\nDo you want a faster case resolution, download FMC Tool tampermonkey script to have 40% quicker case resolution!\nhttps://w.amazon.com/bin/view/Users/fmcasetool/"
                    ]
                }
            }
        },
        "OUTBOUND_SCHEDULING": {
            "Scheduling: Request from Carrier": {
                "Anticipate to destination": {
                    "In transit loads": [
                        "Reject this request and paste blurb",
                        "Hello Carrier,\nIt is not possible to anticipate the unloading of this truck due to dock constraints. Please arrive as scheduled."
                    ],
                    "Not possible due to CPT truck":[
                        "Push back, use blurb and close the case",
                        "Dear Carrier,\nIt is not possible to reschedule this VRID as this is a CPT truck.\nIf you are not able to cover the load at the scheduled time please reject the Load directly on Relay App.\nThank you,Closing case."
                    ]
                },
                "Anticipate to origin": {
                    "Carrier request to anticipate": [
                        "Reject this request and paste blurb",
                        "Hello Carrier,\nIt is not possible to advance the loading of this truck. If you are not able to cover it at the scheduled time please reject the Load\n directly on Relay."
                    ],
                    "Not possible due to CPT truck":[
                        "Push back, use blurb and close the case",
                        "Dear Carrier,\nIt is not possible to reschedule this VRID as this is a CPT truck.\nIf you are not able to cover the load at the scheduled time please reject the Load directly on Relay App.\nThank you,Closing case."
                    ]
                    },
                "Cabotage break": {
                    "Cabotage Constraints": [
                        "3in7-rule: 3 cabotage operations within a 7 days period, starting the day after the final unloading of the international transport.\n\n1in3-rule: if already in cabotage mode and crosses the border, they can perform 1 cabotage within 3 days. If a cabotage conflict is present, raise a replacement and cancel the run.",
                        "Hello Carrier, \n"
                    ]
                },
                "Postpone to Origin/Destination": {
                    "Postpone to Origin/Destination": [
                        "Reject this request and paste blurb",
                        "Hello Carrier,\nIt is not possible to postpone the loading of this truck. If you are not able to cover it at the Scheduled time please reject the Load\n directly on Relay and/or update ETA and LTR."
                    ]
                },
                "Team/Single driver": {
                    "Carrier request- update VRID from team to single driver": [
                        "Check TT in CODA or distance (>500km = team driver) and ONLY update when carrier confirms ETA to destination will not be impacted",
                        "Hello Carrier,\nPlease, confirm if truck will arrive as per scheduled to destination even with single driver"
                    ]
                },
                "Driving ban": {
                    "VRID is impacted by Driving Ban": [
                        "1) Check if the reported driving ban is in place on DB Website: https://trafficban.com/.\n2) In case the reported driving ban is not appearing on DB Website:\n- Check DB at origin, destination and any other country that truck might pass through\n- Inform lead/manager on Shift regarding potential driving ban\n- Ask Site/carrier to provide documentation regarding the reported driving ban (if available)\n3) In case the reported driving ban is also visible on DB Website\nCheck if VRID schedule is impacted by the driving ban duration\n* In case VRID is impacted, check VRID equipment setup:\n- If planned equipment type is not permitted, ask carrier if they will be able to provide equipment type that is permitted. If not possible, open\nbid with correct equipment type and cancel existing VRID\n- If planned equipment type is permitted, inform Site/carrier and request confirmation from the carrier that they will be executing VRID with\nplanned equipment type.\n* In case VRID is not impacted, inform Site/carrier and close case.\n",
                        "Hello Carrier,\nPlease, confirm if you can provide the equipment that is permitted due to Driving Ban.\nPlease, check and confirm ASAP to update the VRID accordingly"
                    ]
                },
                "Incorrect TT": {
                    "Incorrect TT": [
                        "S1: Issue related to Incorrect Transit Time (TT). TT is OK (=CODA): Push back\u00a0 and paste blurb\n\n\nS2: Issue related to Incorrect Transit Time (TT). TT is incorrect (CODA): Check destination will be open (TNT). Make the change to the validated arrival time without breaching CIT. Communicate on the case\n\n\n**IMPORTANT: Do not modify any VRID in case the CIT is breached. Please use CIT Dashboard for validation.",
                        "Hello Carrier,\nIt is not possible to postpone the unloading of this truck. If you are not able to cover it at the scheduled time please reject the\nLoad directly on Relay and/or update LTR and ETA.\nClosing case"
                    ]
                },
                "Site closed": {
                    "Site closed": [
                        "Check TNT",
                        " "
                    ]
                },
                "TNT inaccuracy - Site closed": {
                    "TNT inaccuracy - Site closed": [
                        " ",
                        " "
                    ]
                },
                "Tour Readjustment": {
                    "Tour Readjustment": [
                        "MOST IMPORTANT CHECK:\u00a0After reconnecting always check the entire tour for the\u00a0 below and ensure that the tour:\n\n-Never breaches a maximum of 12hrs in total of working hours and then 11hrs without working in between the next stop.\nEven for BOBTAIL RUNS \u2192 IT CAN NEVER BREACH 12hrs total driving time (never have have a run start and end over 12hrs. Even if you time stamp the origin and don\u2019t expect the carrier to actually go to the origin, this is not permitted.\n\n- If the re connection VRID results in over 12hrs of working hours being VISIBLE in FMC \u2192 then cancel and replace the next loaded run\u00a0 (*Any run that is not a Bobtail or Empty ) instead of reconnecting it. Then reconnect it to the next leg that ensures that they start fresh with 12hrs working time and then 11 hrs minimum of break until then next legs on tours. IMPORTANT - If in doubt that this is not possible , immediately reach out to the problems solve on shift or your lead on shift.",
                        "Hello ,\n "
                    ]
                },
                "Late Truck: Request from Carrier": {
                    "Late Truck Case Raised by Carrier": {
                        "Incorrect Case Carrier": [
                            "Transfer to Late truck lobby",
                            "[Transfer to Late truck lobby]"
                        ]
                    },
            },
                "Loading time": {
                    "Loading time": [
                        " ",
                        " "
                    ]
                }
            },
            "Scheduling: Request from Site": {
                "Anticipate at Destination": {
                    "Destination Site closed or Severe event": [
                        "Insert Blurb",
                        "Hello Carrier,\nPlease note that the destination Site may receive the truck sooner than expected. If this is not possible, please arrive according to the original schedule. Note: It is an informative message, feedback is not necessary."
                    ],
                    "Anticipate at Destination": [
                        "Reject request and Insert Blurb",
                        "Hello Site,\nIt is not possible to anticipate the unloading of the truck due to the lack of a valid business justification and truck will arrive\naccording to the original schedule.\n\nHowever you can proceed to create a note in the VRID visible to carrier to alert of earlier unloading. \nClosing case\n\n\nDo you want a faster case resolution, download FMC Tool tampermonkey script to have 40% quicker case resolution!\nhttps://w.amazon.com/bin/view/Users/fmcasetool/"
                    ],
                    "Not possible due to CPT truck": [
                        "Push back, use blurb and close the case ",
                        "Dear Site,\nIt is not possible to reschedule this VRID as this is a CPT truck.\nIf you need to anticipate, you could inform the driver that site can receive the truck earlier, for this please add a Note for the VRID in FMC, without opening a case.\nMake sure to mark the option: “Visible to carrier”. \n\nIf you need to postpone, please raise a case in FMC with topic 'FMC-Remove Truck' (queue not related to Support), here the correct team will help to cancel this VRID and replace it within another hour.\nThank you,\nClosing case.\n\n\nDo you want a faster case resolution, download FMC Tool tampermonkey script to have 40% quicker case resolution!\nhttps://w.amazon.com/bin/view/Users/fmcasetool/"
                    ],
                },
                "Anticipate at Origin": {
                    "Not possible due to CPT truck": [
                        "Push back, use blurb and close the case ",
                        "Dear Site,\nIt is not possible to reschedule this VRID as this is a CPT truck.\nIf you need to anticipate, you could inform the driver that site can receive the truck earlier, for this please add a Note for the VRID in FMC, without opening a case.\nMake sure to mark the option: “Visible to carrier”. \n\nIf you need to postpone, please raise a case in FMC with topic 'FMC-Remove Truck' (queue not related to Support), here the correct team will help to cancel this VRID and replace it within another hour.\nThank you,\nClosing case.\n\n\nDo you want a faster case resolution, download FMC Tool tampermonkey script to have 40% quicker case resolution!\nhttps://w.amazon.com/bin/view/Users/fmcasetool/"
                    ],
                    "VRID is part of a tour": [
                        "VRID is part of a tour: Push back and ask the Site to request an adhoc if needed\n",
                        "Hello Site,\nAs the truck belongs to a Tour the rescheduling of the truck is not possible, please review the risk of the leftovers and raise an\nAdd truck case if needed through FMC.\n\n\nDo you want a faster case resolution, download FMC Tool tampermonkey script to have 40% quicker case resolution!\nhttps://w.amazon.com/bin/view/Users/fmcasetool/"
                    ],
                    "Sweeper truck. Last minute request (<2h)": [
                        "Push back and ask the Site to request an adhoc if needed\n",
                        "Hello Site,\nAs the request is for a time change for <2 hours change, we cannot make this change, please review the risk of the leftovers and raise an Add truck case if needed through FMC.\n\n\nDo you want a faster case resolution, download FMC Tool tampermonkey script to have 40% quicker case resolution!\nhttps://w.amazon.com/bin/view/Users/fmcasetool/"
                    ],
                    "Sweeper truck. Request in advace (>2h). Destination will be closed": [
                        "Insert Blurb",
                        "Hello Carrier,\nDestination Site will be closed and therefore we cannot make this change, please review the risk of the leftovers and raise an Add truck case if needed through FMC.\n\n\nDo you want a faster case resolution, download FMC Tool tampermonkey script to have 40% quicker case resolution!\nhttps://w.amazon.com/bin/view/Users/fmcasetool/"
                    ],
                    "Sweeper truck. Request in advance (>2h) ETA provided": [
                        "Insert Blurb",
                        "Dear Carrier,\nPlease check if load could be adjusted based on site request.\nNew SAT:\nNew SDT:\n\nPlease let us know asap if rescheduling is possible."
                    ],
                    "Sweeper truck. Request in advance (>2h)": [
                        "Insert Blurb",
                        "Dear carrier, \nPlease be informed that the origin site has capacity to load this truck earlier than scheduled. \nIf possible, please ask driver to advance this truck to origin. \nCase closed"
                    ],
                    "Sweeper truck. Request in advance (>2h). Carrier Reject": [
                        "Insert Blurb",
                        "Hello Site,\nYour request has been rejected by the carrier, therefore is not possible to reschedule this VRID.\nReview the risk of leftovers and raise an Add truck case if needed\n\n\nDo you want a faster case resolution, download FMC Tool tampermonkey script to have 40% quicker case resolution!\nhttps://w.amazon.com/bin/view/Users/fmcasetool/"
                    ]
                },
                "Loading time": {
                    "Loading time": [
                        " ",
                        " "]
                },
                "Not a Scheduling Error": {
                    "Drop & Swap": [
                        "S1: Site asks to change shipper account from empty to a ATSWarehouseTransfers load (applies for MEU Amazon Managed trucks\nonly). Drop & swap destination Site\na.Verify if units are reactive using RCTC tool and make sure the load will be delivered before respective deadline.\nb. Check with carrier (chime/call/email) and via whether drivers have sufficient working time. Ask carrier for confirmation of\nthis change, especially if it\u2019s the first or last leg of the tour.\n\nS2: Site asks to change shipper account from empty to a ATSWarehouseTransfers load (applies for MEU Amazon Managed trucks\nonly). Live unloading destination Site:\na. Follow the same Process as for drop & swap Sites. In addition, take a look at the whole tour and make sure destination Site\nwill have enough time for live unloading and live loading of following VRID.\n\n\n",
                        "Hello ,\n"
                    ],
                    "Modification of Tour": [
                        "\nSite asks to reroute the truck to another lane (applies for Amazon Managed only):\u00a0 Push back since a Tour should not be modify. Ask to the Site to raise an Add truck case if needed",
                        "As the truck belongs to a Tour the redirection of the truck is not possible, please review the risk of the leftovers and raise an Add\n truck case if needed through Freight Management Console (FMC).\n\n\nDo you want a faster case resolution, download FMC Tool tampermonkey script to have 40% quicker case resolution!\nhttps://w.amazon.com/bin/view/Users/fmcasetool/"
                    ],
                    "Double Deck Trailers": [
                        " Sites requests to change CRID for Double Deck Trailer - Area Manager (AM) Tours: *UK ONLY*\nDock Door (DD) trailers with CRID as ATS_Round_Trip are meant to be utilized as Single Deck Trailers.\nDD trailers with CRID as ATS_Round_Trip-DD are meant to be utilized as Double Deck Trailers.\na. Push back and instruct Site that CRID will not be amended, as this goes against their Process. Instead they should correctly optimize these trailers as per configuration on INSITE.",
                        "Hello Site,\nROC cannot accommodate this request as it is in breach of Site Process as communicated by Amazon Customer Excellence Systems (ACES).\n Please adhere to the CRID field in FMC to know how to correctly optimize these DDTs as per the configuration in INSITE.\n For further support reach out to ATS ACES ST Team.\n\n\nDo you want a faster case resolution, download FMC Tool tampermonkey script to have 40% quicker case resolution!\nhttps://w.amazon.com/bin/view/Users/fmcasetool/"
                    ]
                },
                "Postpone at Destination": {
                    "Postpone at Destination": [
                        "Regardless of the type of load if the destination Site requests to postpone the Unloading arrival time please transfer the case Unloading delay queue",
                        " "
                    ]
                },
                "Postpone at Origin": {
                    "Postpone at Origin": [
                        "Reject request and Insert Blurb",
                        "Hello Site,\nPostponing a truck requires prior volume validation to Process your request. For this reason, to cancel and replace the run closer to the CPT please raise a new case in FMC with topic \"FMC-Remove Truck\" with reference to the existing case ID.\n\n\nDo you want a faster case resolution, download FMC Tool tampermonkey script to have 40% quicker case resolution!\nhttps://w.amazon.com/bin/view/Users/fmcasetool/"
                    ]
                },
                "Driving Ban": {
                    "VRID is impacted by Driving Ban": [
                        "1) Check if the reported driving ban is in place on DB Website: https://trafficban.com/.\n2) In case the reported driving ban is not appearing on DB Website:\n- Check DB at origin, destination and any other country that truck might pass through\n- Inform lead/manager on Shift regarding potential driving ban\n- Ask Site/carrier to provide documentation regarding the reported driving ban (if available)\n3) In case the reported driving ban is also visible on DB Website\nCheck if VRID schedule is impacted by the driving ban duration\n* In case VRID is impacted, check VRID equipment setup:\n- If planned equipment type is not permitted, ask carrier if they will be able to provide equipment type that is permitted. If not possible, open\nbid with correct equipment type and cancel existing VRID\n- If planned equipment type is permitted, inform Site/carrier and request confirmation from the carrier that they will be executing VRID with\nplanned equipment type.\n* In case VRID is not impacted, inform Site/carrier and close case.\n",
                        "Hello Carrier,\nPlease, confirm if you can provide the equipment that is permitted due to Driving Ban.\nPlease, check and confirm ASAP to update the VRID accordingly"
                    ]
                },
                "Site closed": {
                    "Site closed": [
                        "Check TNT and ask for it to be updated",
                        " "
                    ]
                },
                "TNT inaccuracy - Site closed": {
                    "TNT inaccuracy - Site closed": [
                        " ",
                        " "
                    ]
                },
                "Tour Readjustment":{
                    "Tour readjustment no possible":[
                        "Push back, use blurb and close the case",
                        "Dear Site,\nIt is not possible to reschedule this VRID as its part of a tour, meaning truck has other node to reach timely after this VRID.\nIf you need to anticipate, you could inform the driver that site can receive the truck earlier, for this please add a Note for the VRID in FMC, without opening a case.\nMake sure to mark the option: -Visible to carrier- If you need to postpone, please raise a case in FMC with topic -FMC-Remove Truck- (queue not related to Support), here the correct team will help to cancel this VRID and replace it within another hour.\nThank you,\nClosing case."
                    ]
                }
            }
        },
        "SUPPORT": {
            "Support: Request from Carrier": {
                "+48h Cases": {
                    "VRID is not part of a tour. From\u00a0 ATS carrier": [
                        "Insert Blurb",
                        "Please be aware that the Frontline Ops team only deals with runs with positioning time within the upcoming 48hrs.\nIf you cannot support the current schedule, please, reject the load in Relay with corresponding reason. Your call out will be validated and appropriate actions taken from Amazon side. Run will be either reassigned to a different carrier or in case of a valid call out for rescheduling, you will be assigned a new VRID with corrected timings."
                    ],
                    "VRID is not part of a tour. From commercial carrier (no access to SIM)": [
                        "Insert Blurb",
                        "Please be aware that the Frontline Ops team only deals with runs with positioning time within the upcoming 48hrs.\nIf you require schedule adjustments after this threshold, be aware that the feedback process for Commercial Carriers is handle via the email alias to Post Scheduling team or via Carrier Manager so please use the correct path to escalate the issue."
                    ]
                },
                "Accessorial Approvals issues": {
                    "Carrier Accessorials": [
                        "Carrier requesting approval of accessorial charges ( detention, redelivery, rerouting and storage)\n\nCarrier has to create a request to Accessorials and the request should not come from existing case raised for DM team.\nPlease push back the carrier to add a new case with correct subject line  \nPlease use the below blurb and close case",
                        "Dear Carrier,\n Thank you for contacting us, it looks like you have an  accessorial charge issue. \n To know the amount you can claim, please refer to your  Carrier & Interchange Agreement. Please note that you cannot claim  accessorial charges whilst a VRID is still in transit. \nSee your FAQ’s in  Relay for more support.\nRegarding extra costs please raise a separate case by  following the steps below: \n1.Log in to Relay \n2.Open the Support Centre tab > Open Tab > Create  New button \n3.Select the Accessorial Approval topic \n4.Add the case ID for evidence \n\nIf the above routes did not assist you in solving this  issue then we kindly recommend you to attend our FAQ dedicated session, \nto  help you further familiarize with the claiming process, review your inbox for  a monthly topic calendar. \n\nThis case will now be resolved as this team cannot support  you with this type of query."
                    ]
                },
                "AFP Tour Single VRID Rejected by Carrier - Mechanical Issue":{
                    "AFP TOUR Single VRID Rejected due Mechanical Issue": [
                        "Please wait for carrier's reply with proper documentation to cancel any VRID or reconnect the TOUR affected by the mechanical issue.\nOnce documentation is provided, remember to cancel VRIDs affected as PRIMARY CARRIER REJECT.\nUse blurb below and snooze case for 1hour\nIf no reply from the Carrier after the first snooze, please continue with cancellations as per Carrier request.",
                        "Dear Carrier,\nTo ensure the highest standards of service and maintain operational efficiency, we kindly request the following documentation when submitting a mechanical cancellation request:\n1. Tractor ID/License plate affected\n2. A copy of the official Inspection/Workshop report\n3. A detailed description of the mechanical issue\n4. Supporting visual evidence (photo or video) attached to the case\nThis additional information will help us to process your request more efficiently and with correct decisions. Please note that VRID cancellations will be approved only when the provided documentation sufficiently justifies the need for cancellation.\nROC team is looking forward to your reply,\nRegards"
                    ]
                },
                "Carrier Rejecting TOUR VRID via Case Amazon Schedule  Change": {
                    "Tour Amended: Amazon Controllable: Schedule Change": [
                        "Check the whole Tour and open replacement bid and Insert Blurb with VRID bridge to reconnect",
                        "\nHello Carrier, requested VRIDs have been cancelled and tour  has been adjusted. \n\n  Please confirm if any other VRIDs are impacted by Schedule Change so ROC can  take action and recover them"
                    ]
                },
                "Carrier Rejecting TOUR VRID via Case due to Amazon  Scheduling Error": {
                    "Tour Amended: Amazon Controllable: Amazon Scheduling Error": [
                        "Check the whole Tour and open replacement bid and Insert Blurb with VRID bridge to reconnect",
                        "Hello Carrier, requested VRIDs have been cancelled and tour  has been adjusted. \n\n  Please confirm if any other VRIDs are impacted by Scheduling Error so ROC can  take action and recover them"
                    ]
                },
                "Carrier Rejecting TOUR VRID via Case due to ATS Trailer  Missing or Damaged": {
                    "Tour Amended: Amazon Controllable: Fleet Issue": [
                        "1.Trailer missing- cancel VRID and change to bobtail movement. Check next leg if its drop or detached to readjust the TOUR. 2- damaged, before trasnfering to fleet team, check if TOUR readjustment is needed",
                        "Hello Carrier, requested VRIDs have been cancelled and tour  has been adjusted. \n\n  Please confirm if any other VRIDs are impacted by ATS Asset Issue so ROC can  take action and recover them"
                    ]
                },
                "Carrier Rejecting TOUR VRID via Case due to Carrier  Scheduling Error": {
                    "Tour Amended: Carrier Controllable - Carrier Scheduling  Error": [
                        "Check the whole Tour and open replacement bid and Insert Blurb with VRID bridge to reconnect",
                        "Hello Carrier, requested VRIDs have been cancelled and tour  has been adjusted. \n\n  Please confirm if any other VRIDs are impacted by Scheduling Error so ROC can  take action and recover them"
                    ]
                },
                "Carrier Rejecting TOUR VRID via Case due to Driver Sick": {
                    "Tour Amended: Carrier Controllable - Driver Sick": [
                        "Check the whole Tour and open replacement bid and Insert Blurb with VRID bridge to reconnect",
                        "Hello Carrier, requested VRIDs have been cancelled and tour  has been adjusted. \n\n  Please confirm if any other VRIDs are impacted by Driver sickness so ROC can  take action and recover them"
                    ]
                },
                "Carrier Rejecting TOUR VRID via Case due to Truck  Mechanical Failure": {
                    "Tour Amended: Carrier Controllable \u2013 Mechanical": [
                        "Check the whole Tour and open replacement bid and Insert Blurb with VRID bridge to reconnect",
                        "Hello Carrier, requested VRIDs have been cancelled and tour  has been adjusted. \n\n  Please confirm if any other VRIDs are impacted by Mechanical Failure so ROC  can take action and recover them"
                    ],
                    "Tour Amended: AFP Carrier":[
                        "",
                        "Dear Carrier,\nVRIDs cancelled as per your request, please raise a case to Performance Dispute (afp-performance-disputes@amazon.com) in order to not affect your performance for this mechanical issue.\nBids raised: XXXXX\n\nClosing case"
                    ],
                    "Entire Tour Rejection AFP Carrier": [
                        "",
                        "Dear Carrier,\nPlease reject the entire tour on Relay App as a “mechanical issue”. After rejecting the tour under reason “mechanical issue”, please raise a case to Performance Dispute (afp-performance-disputes@amazon.com) in order to not affect your performance for this mechanical issue.\nThank you,\nClosing case"
                    ]
                },
                "Carrier Rejecting Single VRID via Case":{
                    "Carrier Reject of a Single VRID":[
                        "Insert Blurb",
                        "Hello Carrier, \n\nPlease do not open cases to inform about VRID rejections. You only need to  reject the run on relay so ROC can track it and find a replacement.\nCase closed"
                    ]
                },
                "Carrier Performance issues": {
                    "Carrier Performance": [
                        "For all cases related to Carrier Performance (Acceptance, On Time, GPS, App Usage, Disruption Free).\nCarrier has to create a request to Carrier Management team and the request should not come from existing case raised for DM team.\nPlease push back the carrier to add a new case with correct subject line  \nPlease use the below blurb and close case",
                        " Dear Carrier,\nYou have contacted the incorrect POC/Team as we cannot support you with your issue. Please see below guidance shared by the carrier support team on how you can receive support as we will now resolve this case.\n\nA new and improved feature has been added to your Relay account which provides guided answers, FAQs and support material for your query. If you still require assistance there will also be an option to message the team through Relay.To access this tool, please follow the below steps:\n\n1.Click >?< on the upper right-hand corner of any page in Relay to open Carrier Smart Support.\n2.Here you will be able to find answers to your performance query by using the FAQ search tool.\n3.If you still need support after reviewing the information there, you will be able to request it by selecting ‘Create a new case’ under the ‘Still need help’ prompt.\n4.You will be directed automatically to the performance dispute team to resolve your query.Please note: you must respond to your case from your Relay application. Any responses sent via email will not be registered. \nTo view your open, closed and pending cases, please navigate to the ‘Support Centre’.\n\nPlease note: You will NOT receive support on performance cases by raising a case from the trips page. You MUST use the ‘?’ button in Relay.\nKind Regards,"
                    ]
                },
                "CMR copy": {
                    "CMR copy": [
                        "S1: VRID is an Amazon Managed Tours and GB/ES/FR/DE/PL/AT/CZ one-way run: Paste the blurb and close the case\n If carrier reopens the case stating Electronic CMR is not visible in R4D, download Electronic CMR from FMC or Outbound (OB)\n Dock Management tool and share with the carrier. Alternatively request Site Operations (OPS) to share a copy.\n\nS2: VRID is other 3P one-way runs: check if Electronic CMR is available in FMC. If Electronic CMR is not available in FMC, download the CMR copy from Outbound Dock Management tool. In case CMR is not available on the platform, request site to provide a copy.",
                        "S1: VRID is an Amazon Managed Tours and GB/ES/FR/DE/PL/AT/CZ one-way run:\nPlease note that once driver confirms a trailer pickup in R4D, the Electronic CMR will be accessible via R4D Application (App). The Electronic CMR will be created both for empty and loaded trips. The printed CMR will not be provided by Site. This is applicable for all Amazon Managed Tours across EU, as well as one-way trips originating in GB, ES, FR, DE, PL, AT or CZ.\n In case the trip was Cancelled before trailer pickup confirmation, there will be no CMR generated as the scheduled trip has been cancelled.\n\n"
                    ]
                },
                "Daily Swap body (SB) adjustment (DSB)": {
                    "Daily Swap body (SB) adjustment (DSB)": [
                        "Daily Swap body (SB) adjustment (DSB)\nEquipment change request\n1. Open VRID in Freight Management Console (FMC)\n2. Go to edit button and change the equipment type as requested by carrier (from ONE_SWAP_BODY to TWO_SWAP_BODIES or Vice versa)\n3.Close the case post adjustment, informing the same to carrier.\n\n Cancellation Request\n1. Open VRID in FMC.\n2. Go to edit button and cancel VRID with reason code \u201cPlanning modification\u201d.\n3. Close the case post cancellation informing the same to carrier.\n\n Additional truck request: VRIDs has to be created manually in FMC (FMC->Action->Create to create VRID) referring to Excel file provided in case",
                        "Hello ,\n"
                   ]
                },
                "Insurance Documents issues": {
                    "Insurance Documents": [
                        "Carriers requiring insurance document renewal/submission/updates",
                        "Dear Carrier,\nYou have contacted the incorrect POC/Team as we cannot support you with your issue. \nPlease see below guidance shared by the carrier support team on how you can receive help with your issue.\nUK - amazontrc-ins@amazon.com \nFRANCE - fr-mm-ops-team@amazon.comSPAIN & PORTUGAL- es-mm-ops-team@amazon.com \nITALY - it-mm-ops-team@amazon.com \nGERMANY & POLAND - relay-meu-documents@amazon.com \nREMAINDER OF THE EU — ceeu-mm-ops-team@amazon.com \n\nONLY EMAIL THE REGION THAT YOUR COMPANY IS REGISTERED WITH AMAZON - OTHER REGION CONTACTS WILL NOT BE ABLE TO SUPPORT YOU"
		    ]
                },
                "Late Truck":{
                    "Incompliant Late to Origin case from Carrier":[
                        "Transfer to Late Truck queue",
                        ""
                    ],
                    "Incompliant Late to Destination case from Carrier":[
                        "Ask the Carrier not to raise a case due to late arrival, instead use Relay App",
                        "Dear Carrier,\nplease don't raise a case to report a late arrival to destination. Please report the new ETA via Relay App with the LTR reason.\nThank you"
                    ]
                },
                "Loading Delay": {
                    "Loading Delay: Case raised after SDT": [
                        "1. Check the loading status to confirm if truck has not yet been loaded.\n\n**In case of Third Party Logistics (3PL) FC\u2019s, data will not be updated in FMC, ALWAYS confirm with FC through the case communication.\n\n2. In case of a loading delay, Reach out directly to site to understand the reason of the delay of loading and carrier for further details (attach blurb)",
                        "Hello Carrier, \nPlease provide more information to evaluate all options.\nDid you arrive on time?\nStart of driver`s next legal break:\nIs equipment/truck needed for next Amazon job?\n\nDear Site,\nPlease provide feedback on the delay of the loading "
                    ],
                    "Loading Delay: Case raised before SDT":[
                        "Paste Blurb, UPDATE it and CLOSE THE CASE",
                        "Dear Carrier,\nPlease note that origin site have at least 1 hour to load the trailers since the SAT.\nWe kindly ask you to only open cases after the Scheduled Depature Time (SDT) or if there might be any operational or customer impact (eg. drivers are run out of working time, impact on the next amazon load).\nIn these scenarios, provide all required information for us to take correct actions,\n\nNote SDT XX/XX/XX hh:mm\nCase closed.\nThank you"
                    ]
                },
                "Not Late": {
                    "Not Late Regular Carrier": [
                        "Insert blurb and close the case",
                        "Hello Carrier,\nROC team do not update and mark the VRIDs as 'Not Late'.\nPlease open a new case with the creation reason 'Delay LTR Proof'. Always that you need this kind of support you need to create a case with this reason.\nPlease follow the steps below:\n1. Click on 'Support Centre' in the left menu.\n2. Click 'Create a new case'.\n3. Select the right case topic (Delay LTR Proof) to ensure your query is sent to the correct team.\n4. Provide description of your case and add any additional recipients to receive email updates regarding the case.\n5. Attach files.\n6. Click 'Submit' to file the case. After, you will receive an email with the case details.\n7. Manage the case proactively by responding <1hrs.\nCase closed."
                    ],
                    "Not Late AFP Carrier":[
                        "Insert blurb and close the case",
                        "Dear Carrier,\nROC team do not update Late Truck Reasons 'LTR' and cannot make any changes.\nLTR Reasons are Carrier responsibility and should be update accurately based on the actual events leading to the delay within 24 hours.\nAny delay where you think your performance score is wrongfully impacted, please send a performance override request to the dedicated Email address: afp-performance-disputes@amazon.com\n\nFor any further explanation please reach out to your Business Coach.\nClosing case."
                    ]
                },
                "Payments issues": {
                    "Carrier Payments": [
                        "For all cases related to issues with PaymentsCarrier has to create a request to Payments and the request should not come from existing case raised for DM team.\nPlease push back the carrier to add a new case with correct subject line  \nPlease use the below blurb and close case",
                        "Dear Carrier, \nThank you for contacting us, it looks like you have a  cancellation fee of payment dispute query. \nPlease be informed that if you  want to claim cancellation charge, you will need to raise a payment dispute.  \nPlease complete or re-review the course “Understanding the Payments Tab,  Invoices and Disputes” in your Relay Learning Centre for a better  understanding of claim process.  Please be informed that eligible amounts and conditions  are mentioned in your signed Carrier Agreement in Relay. \nSteps to make a payment claim: \n1.Log in to Relay \n2.Under the Payments tab, select the affected invoice \n3.Dispute this invoice with all information added into the  case \n\nThis case will now be resolved as this team cannot support  you with this type of query."
                    ]
                },
                "Site Behavior Issue": {
                    "Site behavior issue": [
                        "Loop in Site Master contacts and request feedback on Carrier's complaint.",
                        " "
                    ]
                },
                "Site Opening Hours": {
                    "Site opening hours": [
                        "Insert and fill blurb and close the case",
                        "Dear Carrier,\nSite XXX opening hours are:\nINBOUND:[paste inbound hours of VRID date]\nOUTBOUND:[paste outbound hours of VRID date]\nThank you.\nClosing case."
                    ]
                },
                "Tech issues": {
                    "Tech issues": [
                        "Relay technical issues include: \ncarrier not able to accept/reject VRID, login/password issues, access to Relay Load Board (RLB), loads visibility on RLB, access to Regional Count Manager (RCM), issues with adding drivers, other accounts, any other tech/account related issues. \n\nThese types of issues are handled by RPTS team, and their working hours are from Monday to Friday 5:30am Critical Entry Time (CET) till 6pm CET. \n\nCheck if issue will impact on any VRID. \nIf carrier is not able to accept or see scheduled trips, download the impacted VRID “Vehicle Run” from FMC and share the excel file with carrier. \nRequest carrier confirmation that the scheduled trips will be executed as planned. \n\nS1: Carrier confirms there is no impact: Transfer the case to relay-customer-support-eu@amazon.com \n\nS2: carrier is unresponsive or confirms that the scheduled trips will be impacted: Create a replacement adhocs and cancel the impacted VRID as “System error”",
                        "Dear Carrier,\nThank you for contacting us. You have contacted the incorrect POC/Team as we cannot support you with your issue.\n Please see below guidance shared by the carrier support team on how you can receive help with your issue \n\nForgotten Password: Please reset this via www.amazon.com\n\n Primary Admin Email Change: The existing Primary Administrator must self-select a different role before appointing a new Primary Administrator. Go to 'Carrier Account' > 'Site Users' and select the current primary admin. In 'User Role' tab, click 'Assign a new Primary Admin', and then select the new Primary Admin. Then, click Save.\n\n Technical Issues (No Relay Access - Account Lock Out): Go to www.amazon.com,, contact Customer Care.\n\n Technical Issues (Access to Relay): Click >?< on the upper right-hand corner of any page in Relay to open Carrier Smart Support, Account Support → Access/Login → Tech Issues. Here you can raise a case for support."
                    ]
                },
                "Time Stamp Issue - Add time stamps (Before SAT) - Carrier": {
                    "Time Stamp before SAT": [
                        "Paste blurb and close the case",
                        "Dear Carrier,\nPlease note that cases requesting to update timestamps should not be raised before the Scheduled Arrival Time, as this will give the opportunity to the site to update those timestamps in the system what will ensure the best accuracy.\nPlease note that all cases opened before SAT would only be processed after the Scheduled Arrival Time.\n\nPlease note that this case is going to be closed.\nThanks for your understanding.\n\nClosing case."
                    ]
                },
                "Time Stamp Issue - Change time stamps (Performance override) - Carrier": {
                    "Time Stamps cannot be changed": [
                        "Paste blurb and close the case",
                        "Dear carrier,\nWe apologize, but the stamps registered in VRID cannot be changed.\nFor any performance related question please see below.\n\nA new and improved feature has been added to your Relay account which provides guided answers, FAQs and support material for your query. If you still require assistance there will also be an option to message the team through Relay.To access this tool, please follow the below steps:\n1.Click >?< on the upper right-hand corner of any page in Relay to open Carrier Smart Support.\n2.Here you will be able to find answers to common issues related to your account, load execution, performance, payments and more.\n3.If you still need support after reviewing the information there, you will be able to request it using the most applicable topic.\n4. The performance dispute team will review your request within 1 business day and begin to work in the background to validate your dispute and provide a performance override.\n\nPlease do not duplicate cases.\nThis case will now be resolved as this team cannot support you with this type of query.\n\nThank you.\nCase closed"
                    ]
                },
                "Time Stamp Issue - Add time stamps (R4D app not working) - Carrier": {
                    "Missing Time Stamps": [
                        "If SA is \u201cFleetManagementEquipmentRepositioning\u201d or \u201cBobtailMovementAnnotation\u201d: update actual arrival time directly, same as SAT.\n\nIf Other SA: Request carrier to provide CMR in order to validate that run has been completed and request carrier to indicate time of arrival. Add blurb\u00a0",
                        "Hello Carrier, \nPlease provide the CMR to validate this run has been completed and indicate the time of arrival.\u00a0 Additionally please remember to ALWAYS utilize and have the R4D app open so time stamps are automatically triggered and avoid the creation of cases."
                    ]
                },
                "Time Stamp Issue - Time stamps not done on time - Site": {
                    "Missing Time Stamps": [
                        "If SA is \u201cFleetManagementEquipmentRepositioning\u201d or \u201cBobtailMovementAnnotation\u201d: update actual arrival time directly, same as SAT.\n\nIf Other SA: Request carrier to provide CMR in order to validate that run has been completed and request carrier to indicate time of arrival. Add blurb\u00a0",
                        "Hello Carrier, \nPlease provide the CMR to validate this run has been completed and indicate the time of arrival.\u00a0 Additionally please remember to ALWAYS utilize and have the R4D app open so time stamps are automatically triggered and avoid the creation of cases."
                    ]
                },
                "Time Stamp Issue - Bobtail VRID - Carrier": {
                    "Time Stamp Issue - Bobtail VRID with past SAT": [
                        "Update time stamps with SAT and SDT hours",
                        "Dear Carrier,\nStamps for bobtail movement are updated now. Please note you can update them manually from your Relay App.\nCase closed"
                    ],
                    "Time Stamp Issue - Bobtail VRID with future SAT": [
                        "Paste blurb and close the case",
                        "Dear Carrier,\nWe can't timestamps for a future SAT. Notice you can manually timestamp SOLO runs from your Relay App.\nCase closed"
                    ]
                },
                "Time Stamp Issue - Time stamp not added on tour reconnection - ROC controllable": {
                    "Time Stamp Issue": [
                        "Check the tour and update the VRID with time stamps as per previous/next VRID with registered stamps.",
                        "Dear Carrier,\nApologies for the mistake, the stamp is updated now\nClosing case"
                    ]
                },
                "Tractor or Trailer ID information": {
                    "Tractor or Trailer not assigned": [
                        "Carrier will provide the tractor/trailer plate on the case. Update this info on the VRID",
                        "Hello Carrier, \nThe tractor ID has been updated to XXXXXX ,\nCase closed"
                    ]
                }
            },
            "Support: Request from Site": {
                "+48h Cases": {
                    "VRID is not part of a tour. INSIDE Amazon": [
                        "Insert Blurb",
                        "Hello,\nPlease be aware that the Frontline Ops team only deals with runs with positioning time within the upcoming 48hrs.\nIf you require changes to loads scheduled after this threshold, please raise a SIM to the Post Scheduling team:\nhttps://river.amazon.com/?org=ats\n\n\nDo you want a faster case resolution, download FMC Tool tampermonkey script to have 40% quicker case resolution!\nhttps://w.amazon.com/bin/view/Users/fmcasetool/"
                    ],
                    "VRID is not part of a tour. From\u00a0 3PL SITE": [
                        "Insert Blurb",
                        "Hello,\nPlease be aware that the Frontline Ops team only deals with runs with positioning time within the upcoming 48hrs.\nIf you require schedule adjustments after this threshold, please make the request via your Amazon 3PL POC or open a thread to Post Scheduling email alias.\n\n\nDo you want a faster case resolution, download FMC Tool tampermonkey script to have 40% quicker case resolution!\nhttps://w.amazon.com/bin/view/Users/fmcasetool/"
                    ]
                },
                "Carrier Parked in Forbidden Area": {
                    "Carrier Parked in Forbidden Area": [
                        "Loop in Carrier and request confirmation vehicle removed from forbidden area",
                        "Hi carrier,\nPlease note that trucks with VRID XXX is parked at an incorrect location.\nPlease instruct your drivers to park the truck on a safe location, and remove the truck from the restricted area asap.\nClosing the case."
                    ]
                },
                "Daily Swap body (SB) adjustment (DSB)": {
                    "Daily Swap body (SB) adjustment (DSB)": [
                        "Daily Swap body (SB) adjustment (DSB)\nEquipment change request\n1. Open VRID in Freight Management Console (FMC)\n2. Go to edit button and change the equipment type as requested by carrier (from ONE_SWAP_BODY to TWO_SWAP_BODIES or Vice versa)\n3.Close the case post adjustment, informing the same to carrier.\n\nCancellation Request\n1. Open VRID in FMC.\n2. Go to edit button and cancel VRID with reason code 'Planning modification'.\n3. Close the case post cancellation informing the same to carrier.\n\nAdditional truck request: VRIDs has to be created manually in FMC (FMC->Action->Create to create VRID) referring to Excel file provided in case",
                        "Hello ,\n"
                    ]
                },
                "DHLPAKET Combined Tours":{
                    "DHL Request": [
                    "Agreement between AMZ & DHL: when there is no other logistical option available, 1 tractor to pull 2 swap bodies with CPTs in proximity. \nPDD cannot be at risk. \nRemember: \n1- Adjust CRID: T xxxxxx \n2- Update subcarrier field 'Combined with...'' \n3- Both VRIDs should have the same SFT at Oritin, same EQ Type. \n4- It is required to edit the earliest VRID Scheduled Departure Times to match with the latest departure time. \nDO NOT change CPT timings.",
                    "Dear all, \nPlease note that the VRIDs are combined as requested.\nIf any further issues, please reopen this case.\nCase closed."
                ]
                },
                "Label issues": {
                    "Label issues": [
                        "Handling any label issue, such as damaged label/print or not in proper condition.\n For 3PL SC Sites, ask the origin Site on case to provide feedback on the bad quality of the printing and follow up that issue is resolved.\n When origin is FC, 3PL FC, SC and AMZL please include the below blurb in the case and close the case.",
                        "Hello,\nPlease be informed that the correct Process to report such incidents is via UNO and not via Cases, for further guidance\n please refer to the following link and wiki:\n Raise a SIM via link: https://tiny.amazon.com/l6rr3lsn/tcorpamazcreaopti\n UNO wiki: https://w.amazon.com/bin/view/UNO_EU_FC-SC-DS/\n\n\nDo you want a faster case resolution, download FMC Tool tampermonkey script to have 40% quicker case resolution!\nhttps://w.amazon.com/bin/view/Users/fmcasetool/"
                    ]
                },
                "Misrouted Shipments": {
                    "Misrouted Shipments": [
                        "How to handle cases for misrouted shipments to one FC:\n 1) Ask the loading FC to provide a feedback on the situation\n 2) Ask the unloading FC if the shipments can be rerouted to the correct Site directly. If not, confirm with the loading Site the possibility to return the goods back.\u00a0",
                        "Hello,\n "
                    ]
                },
                "MNR- Manifest not Received ": {
                    "MNR- Manifest not Received ": [
                        "Loop in Origin Site and request confirmation data is provided",
                        "Hello,\n "
                    ]
                },
                "Tractor ID or Driver Details": {
                    "Tractor ID or Driver Details": [
                        "Loop in Carrier and request confirmation details are upadated via FMC/Relay",
                        "Hello,\n "
                    ]
                },
                "Truck Filter": {
                    "Truck Filter": [
                        "Update Truck Filter",
                        "Hello,\n "
                    ]
                },
                "Time Stamp Issue - Incorrect stamp - Site": {
                    "Time Stamp input by Site mistake": [
                        "Loop in Carrier and ask to arrive as scheduled.",
                        "Hello XXXX, \nthis case is just to inform that the site timestamped by mistake, please proceed as scheduled.\nThank you so much, case closed \n "
                    ]
                    }
            }
        },
        "UNLOADING_DELAY": {
            "Unloading Delay: Request from Carrier": {
            "Case raised before SAT + 2hrs ": {
                "Case raised before SAT +2h": [
                "Check  FMC and check if the carrier is raising the case too early.",
			    "Dear Carrier,\nPlease note that as per Carrier Terms of Service (point 3b. Detention, Amazon Relay Operations Centre) detention starts accruing 2 hours after Scheduled Arrival Time.  Please avoid raising an unloading delay case before this time, as such cases will not be accepted as supporting documentation for accessorial charge claims.\nIf two hours have passed since the Scheduled Arrival Time and your truck is still waiting for loading or unloading, please raise a new case immediately. The accessorial charges team will only accept cases opened within one hour after detention has started.\nIf the facility delay will affect your ability to position on time for other loads due to lack of working/ driving hour of drivers or equipment availability constraints, please reject the affected loads on Relay trips pages using reason code AMAZON_FACILITY_DELAY.\n\nClosing case."
                ]
        },
            "Case raised after SDT: trailer dropped in yard, not unloaded yet": {
		    "Trailer dropped and full in yard": [
                "Check  FMC, Event Report and Unified Portal and if SDT is in future : paste blurb, add Destination site contacts and close the case.\n\nIf trailer has been unloaded per all systems and case communication doesnt state the contrary : share unloading stamps and close case.",
		        "Hello Site,\ncould you please advise on unloading of trailer XXXXXXXX full in yard?\nPlease share the exact date and time when the trailer will be offloaded."
                ]
        },
            "Case raised after SDT: not unloaded yet": {
            "Single VRID": [
                "Before answering about the issue itself, take these actions:\nCheck unloading status of the VRID using internal tools.\nCheck if there is existing case related to the same issue for the VRID.\nIf truck was NOT unloaded, and no previously opened case, reply with this blurb and snooze case\nIf carrier will not be able to execute the next run, or it will cause operational/Customer Impact (CX), raise a bid with FC controllable creation reason. Annotate the TP ID on case and update subject line.",
                "Hello Site,\nPlease confirm if VRID was unloaded? \nIf no please provide: new unloading slot: \nreason for delay: can you DROP/SWAP? \n \nDear carrier, \ncan you please confirm if same truck is used for any other future loads?\nRegards\nThank you"
                ],
            "Site Closed": [
                    "Check TNT - Follow up according to site opening hours",
                    ""
                ],
            "Part of a tour":[
                "Check VRID if truck arrived on time and based on that adjust the template below.\nDo not wait for the Stakeholder feedback, follow below Steps to take proactive action in order to minimize downstream impact.\nAsk the carrier to confirm if next Outbound load will be impacted due to delay:\n(If trailer is unloaded - no need for carrier to provide next loading VRID)\n• Open tour in FMC and check if there is any Outbound trip (customer facing) planned after the VRID impacted by the unloading delay.\n• If there is Outbound trip after the impacted VRID, confirm with carrier if they will be able to execute the next run as planned.\n• If carrier confirms that, due to HOS or unloading timing, they will not be able to execute next run, raise a bid with FC controllable creation reason.\nAnnotate the TP ID on case and update subject line.",
                ""
                ],
            "Carrier unresponsive for +3 days":[
                "Due to Carrier Unresponsive for more than 3 days in Unloading Delay issue, the case will be transferred to Loss & Prevention team.\nIn addition, please create an MCM to report potential LP issue, selecting the most relevant topic: “Assistance with Carrier Communication/Loss & Prevention Support”.\nFurther guideline on how to create SIM can be found here:\n\nMCM: https://river.amazon.com/LHR35/workflows?buildingType=ats&q0=b28e88c4-6ced-4de3-a155-31627107e866&q1=0b97954e-dfff-495b-936d-723f4ee696df&q2=b33aa025-b08a-41f3-ac27-133879a3bcf0&id=b33aa025-b08a-41f3-ac27-133879a3bcf0\nSIM: https://quip-amazon.com/UlNeAbXRHkpv/How-To-Escalate-in-Peak-ROC-DM-and-Carriers#temp:C:AGXf531b010ca154adea770ca91a",
                "Hello Loss & Prevention team,\nPlease support on this case.\nIt is issue due to carrier unresponsive for more than 3 days in Unloading Delay case, which falls within your scope.\nKindly proceed to action and avoid transferring to ensure we provide the most optimal support.\nThank you”."
            ]
        },
            "Carrier raised after SDT: Trailer ALREADY unloaded":{
            "Trailer ALREADY unloaded": [
                        "Before answering about the issue itself, take these actions:\nCheck unloading status of the VRID using internal tools.\nCheck if there is existing case related to the same issue for the VRID.\nIf truck was unloaded, and no previously opened case, reply with this blurb and close case",
                        "Dear Carrier,\nVRID XXXXXX was unloaded “PASTE TIME FROM FMC/EVENT REPORT”.\nClosing case"
                ]
        }
            },
                "Unloading Delay: Request from Site": {
            "New Unloading Slot: Single VRID": {
                    "New unloading slot": [
                        "Check FMC, Event Report and Unified Portal and if trailer is NOT unloaded : paste blurb, add Carrier email and snooze the case. \n\nIf carrier send a next VRID, check the ETA, if is arriving late due to this ULD, raise a bid.",
                           "Hello Carrier,\nPlease provide more information to evaluate all options.\nDo you confirm new unloading slot? Yes or No.\nStart of driver`s next legal break:\nCan this affect next VRID?\nCan it be DROP/SWAP?\nCarrier can you please confirm if same truck is used for any other future loads? If so, please keep updated ETA of delay.\nThank you"
                 ]
            },
            "New slot: VRID part of a TOUR, next trip Customer Facing": {
                    "New unloading slot": [
                        "Check  FMC, Event Report and Unified Portal and if trailer is NOT unloaded :\nOpen tour in FMC and check if there is any Outbound trip (customer facing) planned after the impacted VRID \nIf yes: Create a bid for next run, paste blurb, add Carrier email and snooze the case \nIf not: paste blurb 'no CX trip planned', add Carrier email and snooze the case",
                           "Hello Carrier,\nPlease provide more information to evaluate all options.\nDo you confirm new unloading slot? Yes or No.\nStart of driver`s next legal break:\nCan this affect next VRID?\nCan it be DROP/SWAP?\nCarrier can you please confirm if same truck is used for any other future loads? If so, please keep updated ETA of delay.\nThank you"
                   ]
            },
           "New slot: VRID part of a TOUR, next trip NOT Customer Facing": {
                    "New unloading slot": [
                        "Check  FMC, Event Report and Unified Portal and if trailer is NOT unloaded :\nOpen tour in FMC and check if there is any Outbound trip (customer facing) planned after the impacted VRID \nIf yes: Create a bid for next run, paste blurb, add Carrier email and snooze the case \nIf not: paste blurb 'no CX trip planned', add Carrier email and snooze the case",
                           "Hello Carrier,\nPlease provide more information to evaluate all options.\nDo you confirm new unloading slot? Yes or No.\nStart of driver`s next legal break:\nCan this affect next VRID?\nCan it be DROP/SWAP?\nCarrier can you please confirm if same truck is used for any other future loads? If so, please keep updated ETA of delay.\nThank you"
                     ]
            }
        }
        },
        "RECOVERY": {
            "_____________________________ RECOVERY _____________________________": {
            }
        },
        "LATE_TRUCK": {
            "Late Truck: Request from Carrier":{
                "Late Truck Case Raised by Carrier":{
                    "Incorrect Case Carrier":[
                        "Check if LTR has been updated/bid has already been raised.\n\nIf not, update LTR and raise a bid following Wims Late Truck SOP thresholds are raise a case to sourcing to monitor.\nClose this case.",
                        "[DELETE DIRECTIONS BEFORE REPLYING:\nCheck if LTR has been  updated/bid has already been raised.\nIf not, update LTR and raise a bid  following Wims Late Truck SOP thresholds and raise a case to sourcing to monitor.\nClose this case guiding the carrier] \n\nHello Carrier, Please do not raise a case to inform ROC about the delay,\n and instead just update LTR and ETA using \"Report a Delay\" option.\nIf  you need to provide Late Truck Proofs to Carrier Operations team, use R4C  topic \"Delay LTR Proof\"\n\n-Case closed-"
                    ]
                },
                "Late Carrier Rejection (within 6hrs to SAT)": {
                    " ": [
                        " ",
                        " "
                    ]
                }
            },
            "Late Truck:\u00a0Request from Site": {
                "Case Incorrectly Raised by Site": {
                    "Incorrect Case Site": [
                        "First check if there is WIMS item for CF to use the case transferring to sourcing\u00a0 or Insert Blurb",
                        "\n[DELETE DIRECTIONS BEFORE REPLYING: Check if bid has  already been raised. If not, raise a bid following Wims Late Truck SOP  thresholds.]\n\n\n  Hello Site, Please DO NOT create late truck cases on Amazon Managed or customer  facing loads (excluding Commercial Carrier Shipper accounts), ROC manages  those late truck issues via proactive disruption WIMS. Please create a case  only if replacement is needed for Non customer facing/Commercial Carrier  Shipper Account Single runs.\n  -Case closed-"
                    ]
                },
                "Late to Destination": {
                    "LT Destination": [
                        "Check if there is a WIMS item already monitoring it to close the case. if not, put the carrier in the loop to provide ETA.Once we have ETA to dest we can close the case.",
                        "Hello Site,\n please DO NOT create late truck cases on Amazon  Managed or customer facing loads (excluding Commercial Carrier Shipper  accounts), ROC manages those late truck issues via proactive Disruption WIMS.  Please create a case only if replacement is needed for Non-customer  facing/Commercial Carrier Shipper Account Single runs.\n  -Case closed-"
                    ]
                },
                "Late to Origin CC Lane": {
                    "LT Origin CC Request feedback": [
                        "If 15 minutes have passed from SAT/ETA and CC is from MEU region (except POLPO and PINDE), UK region or UPSIT in Italy, add carrier to the case, insert blurb and snooze the case.",
                        "Hello Carrier, \nPlease be informed site is reporting truck being late. \nPlease provide ETA immediately, or please confirm if we can activate 3PL"
                    ],
                    "LT Origin CC Raising bid": [
                        "If 15 minutes have passed from SAT and CC is POLPO, PINDE, or an SEU CC (Except for UPSI), add carrier to the case, raise a recovery bid. paste it in the CRID and snooze the case",
                        "Hello Carrier, \nPlease be informed site is reporting truck being late. \nPlease provide ETA immediately.@Site, Replacement bid has been raised [Paste tp-id]"
                    ],
                    "LT Origin CC No answer - Raising SIM": [
                        "If CC from MEU is unresponsive 2hr after CPT or has denied a replacement, raise a SIM to reduce caps following this template -> https://t.corp.amazon.com/create/templates/7675ad99-b02f-4bad-86c3-9801a246d8be \nOnce SIM is raised close the case",
                        "Hello all, \nSIM has been raised to reduce this laneâ€™s next CPT CAP with the corresponding Backlog (BL) package number. This will ensure that there is enough space to depart the Backlog. Here is the SIM: *XXXX* \n\nPlease depart the leftover volume in next scheduled trucks as soon as possible.\nThanks\nCase closed"
                    ]
                },
                "Late to Origin CF Shipper Account with manual stamps": {
                    "LT Origin CF Stamped": [
                        "\u00a0If 15 minutes have passed from SAT/ETA validate following SOP process for CF load. ",
                        "Hello all,\n Due to late truck replacement bid raised XXX. Transferring case to Sourcing  for monitoring"
          ]
                },
                "Late to Origin CF Shipper Account without manual stamps": {
                    "LT Origin CF not Stamped": [
                        " ",
                        "Hello ,\n"
                    ]
                },
                "Late to Origin NCF Shipper Account": {
                    "LT Origin NCF": [
                        "insert blurb\u00a0 If 15 minutes have passed from SAT/ETA\u00a0",
                        "Hello Site,\n\n  Due to late truck, we are following the sourcing of this line, replacement  bid raised XXX, we will keep you posted once awarded.\n  @Carrier Please note that truck is late, please provide new ETA and LTR"
                    ]
                }
            }
        },
        "SOURCING": {
            "Sourcing: Internal Request": {
                "AMXL Audits": {
                    "AMXL Audits": [
                        " ",
                        " "
                    ]
                },
                "Late Truck Monitoring Original vs Replacement": {
                    "LT Monitor OR vs REP": [
                        "site should not be in the loop on monitoring",
                        "Hello Site, due to late truck, we are following the sourcing  of this line, replacement bid raised XXX, we will keep monitor arrivals and  once one of the 2 active VRIDs arrives, the other one will be cancelled  accordingly. \n  *In case VRID is planned as drop trailer, please keep in mind recovery is  placed as detached (live loading)"
                    ],
                    "Original Arrived and Replacement Cancelled": [
                        " ",
                        "Hello all, \nOriginal VRID has arrived, replacement has been cancelled. \n **Paste Y stamp check-in from FMC"
                    ],
                    "Replacement Arrived and Original Cancelled": [
                        " ",
                        "Hi all,\n Recovery VRID has arrived, Original VIRD has been cancelled.\n **Paste Y stamp check-in from FMC"
                    ]
                },
                "Standby": {
                    "Standby": [
                        "dealed in Paragon lobby since Dec 2023",
                        "Hello [SCAC],\n  Raising this case to request Standby Activation of this Dummy VRID [11XXXXX]  to cover the following load:\n  [enter tp]\n  Route: [XXXX->XXXX]\n  Run Type: [Domestic/International]\n  Driver Setup [TeamDriver/SingleDriver]\n  Loading Time: [mm/dd/yyyy hh:mm]\n  Unloading Time: [mm/dd/yyyy hh:mm]\n  Equipment type: [XXX]"
                    ]
                }
            },
            "Sourcing: Request from Carrier": {
                "Carrier Rejecting SINGLE RUN VRID via Case": {
                    "Carrier Rejection": [
                        "Insert Blurb",
                        "\n[DELETE DIRECTIONS BEFORE REPLYING : Validate if recovery  bid is needed as per Rejections SOP. If yes raise a bid and cancel the  rejected VRID.]\n\n  Hello Carrier \n\n  Please do not open cases to inform about VRID rejections. You only need to  reject the run on relay so ROC can track it and find a replacement.\n  -Case closed-"
                    ]
                },
                "Carrier Rejecting TOUR VRID via Case Amazon Schedule  Change": {
                    "Tour Amended: Amazon Controllable: Schedule Change": [
                        "Check the whole Tour and open replacement bid and Insert Blurb with VRID bridge to reconnect",
                        "Hello Carrier, requested VRIDs have been cancelled and tour  has been adjusted. \n\n  Please confirm if any other VRIDs are impacted by Schedule Change so ROC can  take action and recover them"
                    ]
                },
                "Carrier Rejecting TOUR VRID via Case due to Amazon  Scheduling Error": {
                    "Tour Amended: Amazon Controllable: Amazon Scheduling Error": [
                        "Check the whole Tour and open replacement bid and Insert Blurb with VRID bridge to reconnect",
                        "Hello Carrier,\n requested VRIDs have been cancelled and tour\u00a0 has been adjusted. \n\n\u00a0 Please confirm if any other VRIDs are impacted by Scheduling Error so ROC can\u00a0 take action and recover them"
                    ]
                },
                "Carrier Rejecting TOUR VRID via Case due to ATS Trailer  Missing or Damaged": {
                    "Tour Amended: Amazon Controllable: Fleet Issue": [
                        "1.Trailer missing- cancel VRID and change to bobtail movement. Check next leg if its drop or detached to readjust the TOUR. 2- damaged, before trasnfering to fleet team, check if TOUR readjustment is needed",
                        "Hello Carrier,\n requested VRIDs have been cancelled and tour\u00a0 has been adjusted. \n\n\u00a0 Please confirm if any other VRIDs are impacted by ATS Asset Issue so ROC can\u00a0 take action and recover them"
                    ]
                },
                "Carrier Rejecting TOUR VRID via Case due to Carrier  Scheduling Error": {
                    "Tour Amended: Carrier Controllable - Carrier Scheduling  Error": [
                        "Check the whole Tour and open replacement bid and Insert Blurb with VRID bridge to reconnect",
                        "Hello Carrier,\n requested VRIDs have been cancelled and tour  has been adjusted. \n\n  Please confirm if any other VRIDs are impacted by Scheduling Error so ROC can  take action and recover them"
                    ]
                },
                "Carrier Rejecting TOUR VRID via Case due to Driver Sick": {
                    "Tour Amended: Carrier Controllable - Driver Sick": [
                        "Check the whole Tour and open replacement bid and Insert Blurb with VRID bridge to reconnect",
                        "Hello Carrier,\n requested VRIDs have been cancelled and tour  has been adjusted. \n\n  Please confirm if any other VRIDs are impacted by Driver sickness so ROC can  take action and recover them"
                    ]
                },
                "Carrier Rejecting TOUR VRID via Case due to Truck  Mechanical Failure": {
                    "Tour Amended: Carrier Controllable \u2013 Mechanical": [
                        "Check the whole Tour and open replacement bid and Insert Blurb with VRID bridge to reconnect",
                        "Hello Carrier,\n requested VRIDs have been cancelled and tour  has been adjusted. \n\n  Please confirm if any other VRIDs are impacted by Mechanical Failure so ROC  can take action and recover them"
                    ]
                }
            },
            "Sourcing: Request from Site": {
                "Dock Congestion Adhoc Request": {
                    "Non-Volume driven Add Truck": [
                        "Insert Blurb",
                        "Hello all, ad hoc has been raised XXX\n  -Case closed-"
                    ]
                },
                "Late Processing/IB Truck Adhoc Request": {
                    "Non-Volume driven Add Truck": [
                        "Insert Blurb",
                        "Hello all, ad hoc has been raised XXX\n  -Case closed-"
                    ]
                },
                "RLB1/AZNG cases":{
                    "Site request to source RLB1/AZNG": [
                        "Pase blurb and close case",
                        "Dear site,\nPlease be informed that RLB1/AZNG are dummy carriers assigned on pending loads available on Relay.\nROC has visibility of all pending loads on FMC dashboard and manual sourcing is automatically triggered 6h prior SAT by our Capacity Team of all remaining VRIDs. You can monitor pending load on FMC - check if different carrier assigned+accepted or replacement bid created under CRID.\nCase closed"
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

    // ========== POPUP UI ==========
    function showSubcategoryPopup(actions, onSelect) {
        // Remove any existing popup
        const existing = document.querySelector('.wims-enhancer-popup');
        if (existing) existing.remove();

        // Create popup
        const popup = document.createElement('div');
        popup.classList.add('wims-enhancer-popup');
        applyStyles(popup, POPUP_STYLES);

        // Group by subcategory
        const subcategories = [...new Set(actions.map(a => a.subcategory))];
        subcategories.forEach(subcat => {
            const btn = document.createElement('button');
            btn.textContent = subcat;
            btn.style = "margin-bottom:8px;padding:12px;background:#1976D2;color:#fff;border:none;border-radius:4px;cursor:pointer;";
            btn.onclick = () => {
                popup.remove();
                // Show split popup for this subcategory
                const subcatActions = actions.filter(a => a.subcategory === subcat);
                showSplitPopup(subcatActions, onSelect);
            };
            popup.appendChild(btn);
        });

        document.body.appendChild(popup);
    }

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
            btn.textContent = action.blurbName;
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
            btn.textContent = action.blurbName;
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
    });
}
    
function createButtonContainer() {
    const container = document.createElement('div');
    applyStyles(container, CONTAINER_STYLES);

    // Create snooze buttons container
    const snoozeContainer = document.createElement('div');
    Object.assign(snoozeContainer.style, {
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '10px'
    });

    // Add snooze buttons
    const snoozeButtons = [
        { label: '15m', hours: 0.25 },
        { label: '30m', hours: 0.5 },
        { label: '1h', hours: 1 },
        { label: '2h', hours: 2 },
        { label: '4h', hours: 4 },
        { label: '8h', hours: 8 }
    ];

    snoozeButtons.forEach(({ label, hours }) => {
    const button = document.createElement('button');
    button.textContent = label;
    button.title = `Add ${label} hours`;
    Object.assign(button.style, {
        padding: '8px',
        width: '40px',
        height: '40px',
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
});

    // Add search box
    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.placeholder = 'Search categories, topics, blurbs...';
    Object.assign(searchBox.style, {
        width: '25%',
        minWidth: '25%',
        padding: '8px',
        marginBottom: '10px',
        border: '1px solid #444',
        borderRadius: '4px',
        background: '#333',
        color: '#fff',
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'block',
        paddingLeft: '10px',
        paddingRight: '10px'
    });

    // Create buttons container with horizontal scroll
    const buttonsContainer = document.createElement('div');
    Object.assign(buttonsContainer.style, {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        maxHeight: '70px', 
        overflowY: 'auto', 
        overflowX: 'hidden'
    });

    // Update button styles to have minimum width
    const UPDATED_BUTTON_STYLES = {
        ...BUTTON_STYLES,
        minWidth: '200px', // Add minimum width
        flex: '0 0 auto' // Prevent shrinking
    };

    // Search functionality remains the same but uses updated button styles
    searchBox.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        let searchTimeout;
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            buttonsContainer.innerHTML = '';
            
            if (!query) {
                const categories = [...new Set(buttonActions.map(a => a.category))];
                categories.forEach(category => {
                    const button = document.createElement('button');
                    button.textContent = category;
                    applyStyles(button, UPDATED_BUTTON_STYLES);
                    button.onclick = () => {
                        const subcats = buttonActions.filter(a => a.category === category);
                        showSubcategoryPopup(subcats, handleButtonAction);
                    };
                    buttonsContainer.appendChild(button);
                });
            } else {
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

    // Initialize with category buttons
    const categories = [...new Set(buttonActions.map(a => a.category))];
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        applyStyles(button, BUTTON_STYLES);
        button.onclick = () => {
            const subcats = buttonActions.filter(a => a.category === category);
            showSubcategoryPopup(subcats, handleButtonAction);
        };
        buttonsContainer.appendChild(button);
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

// ========== SUBJECT BUILDER ==========
function buildSubject(site, topic) {
    const attr = siteAttributes[site] || {};
    if (attr.region === 'UK') {
        return `★ [${attr.country || ''}][${site}][${attr.type || ''}] ${topic} ★`;
    }
    return `★ [${attr.region || ''}][${attr.country || ''}][${site}][${attr.type || ''}] ${topic} ★`;
}

})();
