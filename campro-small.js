// ==UserScript==
// @name         CamPRO - TEST
// @namespace    http://tampermonkey.net/
// @version      0.5.001.0
// @description  Streamlines WIMS case management with quick action buttons
// @author       camrees
// @match        https://optimus-internal-eu.amazon.com/*
// @grant        none
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/syhros/CamPRO/refs/heads/main/campro-small.js
// @downloadURL  https://raw.githubusercontent.com/syhros/CamPRO/refs/heads/main/campro-small.js
// ==/UserScript==

// 0.4.001.1 - Centered button text, added reply-box-click action, fixed double-star issue, and grouped Transfer buttons.
// 0.5.001.0 - Re-integrated search functionality.

(function() {
    'use strict';

    // ========== STYLES ==========
    const CONTAINER_STYLES = {
        position: 'fixed',
        bottom: '0',
        left: '0',
        width: '100vw',
        height: '80px',
        background: '#1f1f1f',
        padding: '10px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '9998',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
        transition: 'transform 0.3s',
    };

    const QUICK_BUTTON_STYLES = {
        height: '30px',
        width: '50px',
        margin: '2px 4px',
        background: '#444',
        color: 'white',
        border: '1px solid #555',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '11px',
        transition: 'background-color 0.2s',
        lineHeight: '1.2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    };

    const SEARCH_BUTTON_STYLES = {
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
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textAlign: 'left'
    };

    // ========== DATA STRUCTURES ==========

    // Data for Quick Buttons
    const quickButtonData = [
        { "category": "", "subcategory": "FC See below", "topic": "", "subtopic": "", "action": "Resolve", "blurb": "Hello All - @FC, Please be advised on below.\nClosing case.", "status": "Resolved", "snoozeTime": "", "buttonName": "FCSB", "buttonLabel": "FC See below", "parentButton": "" },
        { "category": "", "subcategory": "Carrier See below", "topic": "", "subtopic": "", "action": "Resolve", "blurb": "Hello All - @Carrier, Please be advised on below.\nClosing case.", "status": "Resolved", "snoozeTime": "", "buttonName": "CSB", "buttonLabel": "Carrier See below", "parentButton": "" },
        { "category": "", "subcategory": "FC Closing Case", "topic": "", "subtopic": "", "action": "Resolve", "blurb": "Hello All - @FC, Thank you for the information.\nClosing case.", "status": "Resolved", "snoozeTime": "", "buttonName": "FCC", "buttonLabel": "FC Closing Case", "parentButton": "" },
        { "category": "", "subcategory": "Carrier Closing Case", "topic": "", "subtopic": "", "action": "Resolve", "blurb": "Hello All - @Carrier, Thank you for the information.\nClosing case.", "status": "Resolved", "snoozeTime": "", "buttonName": "CCC", "buttonLabel": "Carrier Closing Case", "parentButton": "" },
        { "category": "", "subcategory": "FC-SBD", "topic": "", "subtopic": "", "action": "Resolve", "blurb": "Hello All - @Site, Please note that we only accept SBD requests coming fro m the Inbound Excellence team (ib-excellence@amazon.com). \n\nNTRBD is not be adjusted manually in this case, as we have a system already in place which will push SBD automatically. In case of a high Severity situation request, refer to wiki - https://w.amazon.com/bin/view/GOX/GOX_DEA/IBExc/LTM/\n\nPlease acknowledge and cascade to all the teams.\nClosing case.", "status": "Resolved", "snoozeTime": "", "buttonName": "FC-SBD", "buttonLabel": "FC Stow By Date", "parentButton": "" },
        { "category": "", "subcategory": "Tour Adjusted", "topic": "Tour Readjustment", "subtopic": "", "action": "Resolve", "blurb": "Hello All - Please be advised the tour has been adjusted as requested.\nClosing case.", "status": "Resolved", "snoozeTime": "", "buttonName": "TOUR ADJ.", "buttonLabel": "Tour Adjusted", "parentButton": "" },
        { "category": "", "subcategory": "VRID Cancelled", "topic": "", "subtopic": "", "action": "Resolve", "blurb": "Hello All - Please be advised the VRID has now been cancelled.\nClosing Case.", "status": "Resolved", "snoozeTime": "", "buttonName": "VRID C", "buttonLabel": "VRID Cancelled", "parentButton": "" },
        { "category": "", "subcategory": "VRID Since Cancelled", "topic": "", "subtopic": "", "action": "Resolve", "blurb": "Hello All - Please be advised this VRID has since been cancelled.\nClosing Case.", "status": "Resolved", "snoozeTime": "", "buttonName": "VRID SC", "buttonLabel": "VRID Since Cancelled", "parentButton": "" },
        { "category": "", "subcategory": "Tour Cancelled", "topic": "", "subtopic": "", "action": "Resolve", "blurb": "Hello All - Please be advised Tour has been cancelled.\nClosing Case.", "status": "Resolved", "snoozeTime": "", "buttonName": "TOUR C", "buttonLabel": "Tour Cancelled", "parentButton": "" },
        { "category": "Timestamp", "subcategory": "Time Stamp Issue - Bobtail VRID - Carrier", "topic": "", "subtopic": "", "action": "Resolve", "blurb": "Dear Carrier,\nStamps for bobtail movement are updated now.\nPlease note you can update them manually from your Relay App.\nCase closed", "status": "Resolved", "snoozeTime": "", "buttonName": "Stamp Bobtail", "buttonLabel": "Time Stamp Issue - Bobtail VRID - Carrier", "parentButton": "TS" },
        { "category": "Timestamp", "subcategory": "Time Stamp Issue - Time stamp not added on tour reconnection - ROC controllable", "topic": "", "subtopic": "", "action": "Resolve", "blurb": "Dear Carrier,\nApologies for the mistake, the stamp is updated now\nClosing case", "status": "Resolved", "snoozeTime": "", "buttonName": "Stamp ROC", "buttonLabel": "Time Stamp Issue - Time stamp not added on tour reconnectio", "parentButton": "TS" },
        { "category": "Timestamp", "subcategory": "Time Stamp Issue - Add time stamps (R4D app not working) - Carrier", "topic": "", "subtopic": "", "action": "Resolve", "blurb": "Hello Carrier, \nPlease provide the CMR to validate this run has been completed and indicate the time of arrival.\nAdditionally please remember to ALWAYS utilize and have the R4D app open so time stamps are automatically triggered and avoid the creation of cases.", "status": "Pending Carrier Action", "snoozeTime": "1", "buttonName": "Stamp R4D", "buttonLabel": "Time Stamp Issue - Add time stamps (R4D) Carrier", "parentButton": "TS" },
        { "category": "", "subcategory": "Tractor or Trailer ID", "topic": "Tractor ID or Driver Details", "subtopic": "", "action": "Resolve", "blurb": "", "status": "Resolved", "snoozeTime": "", "buttonName": "T/T ID", "buttonLabel": "Tractor ID or Driver Details", "parentButton": "" },
        { "category": "", "subcategory": "Driver Details", "topic": "Tractor ID or Driver Details", "subtopic": "", "action": "Resolve", "blurb": "", "status": "Resolved", "snoozeTime": "", "buttonName": "Driver", "buttonLabel": "Driver Details", "parentButton": "" },
        { "category": "Unloading Delay", "subcategory": "ULD +2h SAT", "topic": "Case raised before SAT + 2hrs ", "subtopic": "", "action": "Resolve", "blurb": "Dear Carrier,\nPlease note that as per Carrier Terms of Service (point 3b. Detention, Amazon Relay Operations Centre) detention starts accruing 2 hours after Scheduled Arrival Time.\nPlease avoid raising an unloading delay case before this time, as such cases will not be accepted as supporting documentation for accessorial charge claims.\nIf two hours have passed since the Scheduled Arrival Time and your truck is still waiting for loading or unloading, please raise a new case immediately.\nThe accessorial charges team will only accept cases opened within one hour after detention has started.\nIf the facility delay will affect your ability to position on time for other loads due to lack of working/ driving hour of drivers or equipment availability constraints, please reject the affected loads on Relay trips pages using reason code AMAZON_FACILITY_DELAY.\nClosing case.", "status": "Resolved", "snoozeTime": "", "buttonName": "ULD +2h", "buttonLabel": "ULD Case - Raised before +2h SAT", "parentButton": "" },
        { "category": "Unloading Delay", "subcategory": "ULD Unloaded", "topic": "Carrier raised after SDT: Trailer ALREADY unloaded", "subtopic": "", "action": "Resolve", "blurb": "Hello All - @Carrier, Please be advised as per our system, this VRID has since been unloaded @\nClosing case.", "status": "Resolved", "snoozeTime": "", "buttonName": "ULD UNLD", "buttonLabel": "Unloading Delay Unloaded", "parentButton": "" },
        { "category": "Support", "subcategory": "Loading Delay", "topic": "Loading Delay", "subtopic": "", "action": "Resolve", "blurb": "Hello All - @Carrier, Please be advised as per our system, this VRID has since been loaded @\nClosing case.", "status": "Resolved", "snoozeTime": "", "buttonName": "LOADED", "buttonLabel": "Loading Delay Loaded", "parentButton": "" },
        { "category": "Support", "subcategory": "Truck Departed", "topic": "", "subtopic": "", "action": "Resolve", "blurb": "Hello All - Please be advised as per system, this VRID has since departed @\nClosing case.", "status": "Resolved", "snoozeTime": "", "buttonName": "TD", "buttonLabel": "Truck Departed", "parentButton": "" },
        { "category": "", "subcategory": "Truck Arrived", "topic": "", "subtopic": "", "action": "Resolve", "blurb": "Hello All - Please be advised as per system, this VRID has since arrived @\nClosing case.", "status": "Resolved", "snoozeTime": "", "buttonName": "TA", "buttonLabel": "Truck Arrived", "parentButton": "" },
        { "category": "General Account Support", "subcategory": "Account Support", "topic": "General Account Support", "subtopic": "", "action": "Resolve", "blurb": "", "status": "Pending Amazon \nAction", "snoozeTime": "", "buttonName": "AS", "buttonLabel": "General Account Support", "parentButton": "" },
        { "category": "Accessorial Approvals", "subcategory": "Accessorial Approvals", "topic": "Accessorial Approvals issues", "subtopic": "", "action": "Resolve", "blurb": "Dear Carrier, Thank you for contacting us, it looks like you have an accessorial charge issue.\nTo know the amount you can claim, please refer to your  Carrier & Interchange Agreement.\nPlease note that you cannot claim  accessorial charges whilst a VRID is still in transit.\nSee your FAQ’s in  Relay for more support.\nRegarding extra costs please raise a separate case by  following the steps below: \n1.Log in to Relay \n2.Open the Support Centre tab > Open Tab > Create  New button \n3.Select the Accessorial Approval topic \n4.Add the case ID for evidence \n\nIf the above routes did not assist you in solving this  issue then we kindly recommend you to attend our FAQ dedicated session, \nto  help you further familiarize with the claiming process, review your inbox for  a monthly topic calendar.\nThis case will now be resolved as this team cannot support  you with this type of query.", "status": "Resolved", "snoozeTime": "", "buttonName": "AA", "buttonLabel": "Accessorial Approvals", "parentButton": "" },
        { "category": "General Performance Support", "subcategory": "Performance Support", "topic": "Carrier Performance issues", "subtopic": "", "action": "Resolve", "blurb": "Dear Carrier,\nYou have contacted the incorrect POC/Team as we cannot support you with your issue.\nPlease see below guidance shared by the carrier support team on how you can receive support as we will now resolve this case.\nA new and improved feature has been added to your Relay account which provides guided answers, FAQs and support material for your query.\nIf you still require assistance there will also be an option to message the team through Relay.To access this tool, please follow the below steps:\n\n1.Click >?< on the upper right-hand corner of any page in Relay to open Carrier Smart Support.\n2.Here you will be able to find answers to your performance query by using the FAQ search tool.\n3.If you still need support after reviewing the information there, you will be able to request it by selecting ‘Create a new case’ under the ‘Still need help’ prompt.\n4.You will be directed automatically to the performance dispute team to resolve your query.Please note: you must respond to your case from your Relay application.\nAny responses sent via email will not be registered. \nTo view your open, closed and pending cases, please navigate to the ‘Support Centre’.\nPlease note: You will NOT receive support on performance cases by raising a case from the trips page.\nYou MUST use the ‘?’ button in Relay.\nKind Regards,", "status": "Resolved", "snoozeTime": "", "buttonName": "PS", "buttonLabel": "General Performance Support", "parentButton": "" },
        { "category": "", "subcategory": "DHL SB", "topic": "DHL Swap Body", "subtopic": "", "action": "Resolve", "blurb": "Hello - @FC, Please be advised on below.\nClosing case.", "status": "Resolved", "snoozeTime": "", "buttonName": "DHL SB", "buttonLabel": "DHL Swap Body Notify", "parentButton": "" },
        { "category": "Support", "subcategory": "Not Late Regular Carrier", "topic": "Not Late", "subtopic": "", "action": "Resolve", "blurb": "Hello Carrier,\nROC team do not update and mark the VRIDs as 'Not Late'.\nPlease open a new case with the creation reason 'Delay LTR Proof'.\nAlways that you need this kind of support you need to create a case with this reason.\nPlease follow the steps below:\n1. Click on 'Support Centre' in the left menu.\n2. Click 'Create a new case'.\n3. Select the right case topic (Delay LTR Proof) to ensure your query is sent to the correct team.\n4. Provide description of your case and add any additional recipients to receive email updates regarding the case.\n5. Attach files.\n6. Click 'Submit' to file the case. After, you will receive an email with the case details.\n7. Manage the case proactively by responding <1hrs.\nCase closed.", "status": "Resolved", "snoozeTime": "", "buttonName": "NL", "buttonLabel": "Carrier Not Late", "parentButton": "" },
        { "category": "Support", "subcategory": "Not Late AFP Carrier", "topic": "Not Late", "subtopic": "", "action": "Resolve", "blurb": "Dear Carrier,\nROC team do not update Late Truck Reasons 'LTR' and cannot make any changes.\nLTR Reasons are Carrier responsibility and should be update accurately based on the actual events leading to the delay within 24 hours.\nAny delay where you think your performance score is wrongfully impacted, please send a performance override request to the dedicated Email address: afp-performance-disputes@amazon.com\n\nFor any further explanation please reach out to your Business Coach.\nClosing case.", "status": "Resolved", "snoozeTime": "", "buttonName": "NL-AFP", "buttonLabel": "AFP Carrier Not Late", "parentButton": "" },
        { "category": "Equipment", "subcategory": "Early Drop", "topic": "Early drop - 12-15 hrs to SAT", "subtopic": "", "action": "Resolve", "blurb": "Dear Site,\nPlease note that ROC addresses early drop requests raised >15 hrs to scheduled time.\nAny requests raised within 12-15 hours prior to SAT will be resolved.\nIf there is no drop provided within 12 hours to SAT, kindly raise a <<Missing Drop>> case for further action.\nThank you.", "status": "Resolved", "snoozeTime": "", "buttonName": "ED 12-15h", "buttonLabel": "Early drop - 12-15 hrs to SAT", "parentButton": "" },
        { "category": "Equipment", "subcategory": "Early Drop", "topic": "Early drop - No expected early drop time", "subtopic": "", "action": "Resolve", "blurb": "Dear site,\nPlease note that ROC addresses early drop requests raised more than 15 hours before the scheduled time with expected early drop time.\nAs there is no input regarding the early drop  time, resolving the case.\nPlease create a new case if you still require an  early drop, following the correct template.\nYou can find instructions to download FMC tool to guide you to the right template in a few seconds at this link: https://axzile.corp.amazon.com/-/carthamus/script/fmc-case-tool", "status": "Resolved", "snoozeTime": "", "buttonName": "ED No Drop Time", "buttonLabel": "Early drop - No expected early drop time", "parentButton": "" },
        { "category": "Equipment", "subcategory": "Missing Drop >15h", "topic": "Early drop - 12-15 hrs to SAT", "subtopic": "", "action": "Resolve", "blurb": "Dear Site,\nPlease note that ROC addresses early drop requests raised >15 hrs to scheduled time.\nAny requests raised within 12-15 hours prior to SAT will be resolved.\nIf there is no drop provided within 12 hours to SAT, kindly raise a <<Missing Drop>> case for further action.\nThank you.", "status": "Resolved", "snoozeTime": "", "buttonName": "MD > 15h", "buttonLabel": "Missing Drop >15h", "parentButton": "" },
        { "category": "Equipment", "subcategory": "Drop to Detached", "topic": "", "subtopic": "", "action": "Resolve", "blurb": "Hello All - VRID has been updated to Detached Trailer with 1h loading time, new SAT is\n@Carrier, you may need to accept the change on relay.\nClosing case.", "status": "Resolved", "snoozeTime": "", "buttonName": "D2D", "buttonLabel": "Drop to Detached", "parentButton": "" },
        { "category": "", "subcategory": "48h + Case", "topic": "48h+ Cases", "subtopic": "", "action": "Resolve", "blurb": "Hello - For requests >48hrs or relating to future scheduling, please raise a SIM with Post-Scheduling team or write an e-mail directly to meu-roc-ob-postscheduling@amazon.de (or related regional e-mail). Thank you - Closing case.", "status": "Resolved", "snoozeTime": "", "buttonName": "48h+", "buttonLabel": "48h+ Cases", "parentButton": "" },
        { "category": "", "subcategory": "Carrier Reject", "topic": "", "subtopic": "", "action": "Resolve", "blurb": "Hello - @Carrier, If you are not able to cover this VRID at the scheduled time please reject the load directly on Relay.\nClosing Case.", "status": "Resolved", "snoozeTime": "", "buttonName": "C-REJ", "buttonLabel": "Carrier Reject", "parentButton": "" },
        { "category": "", "subcategory": "Duplicate Case", "topic": "Duplicate Case", "subtopic": "", "action": "Resolve", "blurb": "Hello All - Please note that this case is duplicated from Case ID XXX. We will close this case, but please refer to Case ID XXX because that is where we will provide you with support and keep the correspondence going. Please abstain from creating multiple cases regarding the issue because this creates opportunities for miscommunication for all stakeholders involved. \nClosing Case.", "status": "Resolved", "snoozeTime": "", "buttonName": "DUPE", "buttonLabel": "Duplicate Case", "parentButton": "" },
        { "category": "", "subcategory": "Drop Trailer Expansion Plan - FC", "topic": "Drop Trailer Expansion Plan", "subtopic": "", "action": "Resolve", "blurb": "Hello All - @FC, Please be advised as per the 'EU Drop Trailer Expansion Plan' you are now equipped to accommodate ATS Trailers, allow the driver to drop the trailer and depart them from site.", "status": "Resolved", "snoozeTime": "", "buttonName": "DTEP", "buttonLabel": "Drop Trailer Expansion Plan - FC", "parentButton": "" },
        { "category": "", "subcategory": "Drop Trailer Expansion Plan - Carrier", "topic": "Drop Trailer Expansion Plan", "subtopic": "", "action": "Resolve", "blurb": "Hello All - @Carrier, Please be advised this site is part of the 'EU Drop Trailer Expansion Plan' and are now equipped to accommodate ATS Trailers, inform the driver to drop the trailer and depart them from site.", "status": "Resolved", "snoozeTime": "", "buttonName": "CDTEP", "buttonLabel": "Drop Trailer Expansion Plan - Carrier", "parentButton": "" },
        { "category": "", "subcategory": "FC Feedback", "topic": "", "subtopic": "", "action": "Snooze", "blurb": "Hello All - @FC, Please see below and provide feedback", "status": "Pending FC Action", "snoozeTime": "1", "buttonName": "FCFB", "buttonLabel": "FC Feedback Request", "parentButton": "" },
        { "category": "", "subcategory": "Carrier Feedback", "topic": "", "subtopic": "", "action": "Snooze", "blurb": "Hello All - @Carrier, Please see below and provide feedback", "status": "Pending Carrier Action", "snoozeTime": "1", "buttonName": "CFB", "buttonLabel": "Carrier Feedback Request", "parentButton": "" },
        { "category": "Timestamp", "subcategory": "Time Stamp Issue - Incorrect stamp - Site", "topic": "", "subtopic": "", "action": "Snooze", "blurb": "Hello Carrier, \nPlease provide the CMR to validate this run has been completed and indicate the time of arrival.\nAdditionally please remember to ALWAYS utilize and have the R4D app open so time stamps are automatically triggered and avoid the creation of cases.", "status": "Pending Carrier Action", "snoozeTime": "1", "buttonName": "Stamp Site", "buttonLabel": "Time Stamp Issue - Incorrect stamp - Site", "parentButton": "TS" },
        { "category": "Unloading Delay", "subcategory": "ULD +2h Snooze", "topic": "Case raised after SDT: not unloaded yet", "subtopic": "", "action": "Snooze", "blurb": "Hello All - @FC, Please see below and unload and depart the driver ASAP.\nIf unloading is still pending, please provide a new unloading slot.", "status": "Pending FC Action", "snoozeTime": "2", "buttonName": "ULD SNZ", "buttonLabel": "ULD Case - Not unloaded blurb +2h Snooze", "parentButton": "" },
        { "category": "Unloading Delay", "subcategory": "ULD Started Unloading", "topic": "Case raised after SDT: trailer dropped in yard, not unloaded yet", "subtopic": "", "action": "Snooze", "blurb": "Hello All - @Carrier, Please be advised as per our system, this VRID has started unloading @\nWill check back in 1h", "status": "Pending Carrier Action", "snoozeTime": "1", "buttonName": "ULD SUNLD", "buttonLabel": "Unloading Delay Started Unloading", "parentButton": "" },
        { "category": "Support", "subcategory": "Loading Delay", "topic": "Loading Delay", "subtopic": "", "action": "Snooze", "blurb": "Hello Carrier, Please provide more information to evaluate all options.\nDid you arrive on time?\nStart of driver`s next legal break:\nIs equipment/truck needed for next Amazon job?\n@Site, Please provide feedback on the delay of the loading ", "status": "Pending FC Action", "snoozeTime": "1", "buttonName": "LD", "buttonLabel": "Loading Delay", "parentButton": "" },
        { "category": "Equipment", "subcategory": "Missing Drop - 12-6 hrs to SAT, No threshold", "topic": "Missing Drop", "subtopic": "", "action": "Snooze", "blurb": "Dear Carrier\nAs per the requirement, drop should be provided at least 12 hrs before SAT.\nHowever, since the current time is <12 hrs to SAT, the site has updated they can still accept the drop if you can provide the trailer before - \nkindly update the ETA for drop.\nPlease do drop the trailer at the earliest possible to avoid any impact to your drop trailer compliance score.\nThanks", "status": "Pending Carrier Action", "snoozeTime": "2", "buttonName": "MD 12-6", "buttonLabel": "Missing Drop - 12-6 hrs to SAT, No threshold", "parentButton": "" },
        { "category": "Reactive Scheduling", "subcategory": "RS", "topic": "Cancellation Request", "subtopic": "", "action": "Transfer", "blurb": "", "status": "Pending Amazon Action", "snoozeTime": "", "buttonName": "RS-CT", "buttonLabel": "Cancel Truck", "parentButton": "RS" },
        { "category": "Reactive Scheduling", "subcategory": "RS", "topic": "Adhoc Request", "subtopic": "", "action": "Transfer", "blurb": "", "status": "Pending Amazon Action", "snoozeTime": "", "buttonName": "RS-AD", "buttonLabel": "Adhoc Request", "parentButton": "RS" },
        { "category": "Internal Recovery Monitoring", "subcategory": "Sourcing", "topic": "Recovery", "subtopic": "", "action": "Transfer", "blurb": "", "status": "Pending Amazon Action", "snoozeTime": "", "buttonName": "IRM", "buttonLabel": "Internal Recovery Monitoring / Sourcing", "parentButton": "" },
        { "category": "Late Truck", "subcategory": "Late Truck", "topic": "Late Truck", "subtopic": "", "action": "Transfer", "blurb": "", "status": "Pending Amazon Action", "snoozeTime": "", "buttonName": "LT", "buttonLabel": "Late Truck", "parentButton": "" },
        { "category": "R4S Shipper Support", "subcategory": "Freight", "topic": "", "subtopic": "", "action": "Transfer", "blurb": "", "status": "Pending Amazon Action", "snoozeTime": "", "buttonName": "Freight", "buttonLabel": "Freight Team", "parentButton": "" },
        { "category": "Relo", "subcategory": "Relo", "topic": "", "subtopic": "", "action": "Transfer", "blurb": "", "status": "Pending Amazon Action", "snoozeTime": "", "buttonName": "RELO", "buttonLabel": "Relo Team", "parentButton": "" },
        { "category": "ATS Fleet/Amazon Trailer", "subcategory": "Fleet", "topic": "Trailer Damage", "subtopic": "", "action": "Transfer", "blurb": "", "status": "Pending Amazon Action", "snoozeTime": "", "buttonName": "Damage", "buttonLabel": "Damaged trailer", "parentButton": "Fleet" },
        { "category": "ATS Fleet/Amazon Trailer", "subcategory": "Fleet", "topic": "Bobtail Requiest - Carrier", "subtopic": "", "action": "Transfer", "blurb": "", "status": "Pending Amazon Action", "snoozeTime": "", "buttonName": "Bobtail - C", "buttonLabel": "Bobtail Request - Carrier", "parentButton": "Fleet" },
        { "category": "ATS Fleet/Amazon Trailer", "subcategory": "Fleet", "topic": "Bobtail Requiest - Site", "subtopic": "", "action": "Transfer", "blurb": "", "status": "Pending Amazon Action", "snoozeTime": "", "buttonName": "Bobtail - S", "buttonLabel": "Bobtail Request - Site", "parentButton": "Fleet" },
        { "category": "ATS Fleet/Amazon Trailer", "subcategory": "Fleet", "topic": "VD to VS Request", "subtopic": "", "action": "Transfer", "blurb": "", "status": "Pending Amazon Action", "snoozeTime": "", "buttonName": "VS to VD", "buttonLabel": "VS to VD Request", "parentButton": "Fleet" },
        { "category": "ATS Fleet/Amazon Trailer", "subcategory": "Fleet", "topic": "VS to VD Request", "subtopic": "", "action": "Transfer", "blurb": "", "status": "Pending Amazon Action", "snoozeTime": "", "buttonName": "VD to VS", "buttonLabel": "VD to VS Request", "parentButton": "Fleet" },
        { "category": "Unloading Delay", "subcategory": "ULD", "topic": "Unloading Delay", "subtopic": "", "action": "Transfer", "blurb": "", "status": "Pending \nAmazon Action", "snoozeTime": "", "buttonName": "ULD", "buttonLabel": "Unloading Delay Queue", "parentButton": "" },
        { "category": "NTRBD", "subcategory": "NTRBD", "topic": "NTRBD", "subtopic": "", "action": "Transfer", "blurb": "", "status": "Pending Amazon Action", "snoozeTime": "", "buttonName": "NTRBD", "buttonLabel": "NTRBD", "parentButton": "" },
        { "category": "Relay Technical Support", "subcategory": "Relay Support", "topic": "", "subtopic": "", "action": "Transfer", "blurb": "", "status": "Pending Amazon Action", "snoozeTime": "", "buttonName": "RELAY", "buttonLabel": "Relay Technical Support", "parentButton": "" },
        { "category": "Amazon Sea", "subcategory": "Sea", "topic": "", "subtopic": "", "action": "Transfer", "blurb": "", "status": "Pending Amazon Action", "snoozeTime": "", "buttonName": "SEA", "buttonLabel": "Sea Team", "parentButton": "" },
        { "category": "Internal Recovery Monitoring", "subcategory": "Sourcing: Request from Site", "topic": "RLB1/AZNG cases", "subtopic": "", "action": "Transfer", "blurb": "Please be informed that your case is being transferred to the dedicated team for better support.", "status": "Pending Amazon Action", "snoozeTime": "", "buttonName": "RBL1/AZNG", "buttonLabel": "RLB1/AZNG cases", "parentButton": "" },
        { "category": "", "subcategory": "", "topic": "", "subtopic": "", "action": "", "blurb": "", "status": "", "snoozeTime": "", "buttonName": "TS", "buttonLabel": "Timestamps", "parentButton": "" },
        { "category": "", "subcategory": "", "topic": "", "subtopic": "", "action": "", "blurb": "", "status": "", "snoozeTime": "", "buttonName": "RS", "buttonLabel": "Reactive Scheduling", "parentButton": "" },
        { "category": "", "subcategory": "", "topic": "", "subtopic": "", "action": "", "blurb": "", "status": "", "snoozeTime": "", "buttonName": "Fleet", "buttonLabel": "ATS Fleet", "parentButton": "" }
    ];

    /**
     * Processes the raw button configuration into a structured format for UI creation.
     */
    function processQuickButtons(config) {
        const topLevelButtons = [];
        const nestedButtons = {};

        config.forEach(item => {
            if (item.parentButton) {
                if (!nestedButtons[item.parentButton]) {
                    nestedButtons[item.parentButton] = [];
                }
                nestedButtons[item.parentButton].push({
                    name: item.buttonName,
                    label: item.buttonLabel,
                    action: {
                        type: item.action,
                        blurb: item.blurb || null,
                        status: item.status ? item.status.replace('\n', '') : null,
                        snooze: item.snoozeTime ? parseFloat(item.snoozeTime) : null,
                        category: item.category || null,
                        topic: item.topic || null
                    }
                });
            }
        });

        config.forEach(item => {
            if (!item.parentButton) {
                topLevelButtons.push({
                    name: item.buttonName,
                    label: item.buttonLabel,
                    isParent: !!nestedButtons[item.buttonName],
                    children: nestedButtons[item.buttonName] || [],
                    action: {
                        type: item.action,
                        blurb: item.blurb || null,
                        status: item.status ? item.status.replace('\n', '') : null,
                        snooze: item.snoozeTime ? parseFloat(item.snoozeTime) : null,
                        category: item.category || null,
                        topic: item.topic || null
                    }
                });
            }
        });
        return topLevelButtons;
    }

    const quickButtons = processQuickButtons(quickButtonData);

    // --- ADDED: Data for Search Functionality (Restored from original script) ---
    const siteDictionary = { "UK": { "UK": { "FC": ["BHX1", "BHX2", "BHX3", "BHX4", "BHX5", "BRS1", "BRS2", "CWL1", "EMA1", "EMA2", "EUK5", "EUSV", "GLA1", "LBA1", "LBA2", "LBA3", "LBA4", "LCY1", "LCY2", "LCY3", "LCY4", "LTN1", "LTN2", "LTN4", "MAN1", "MAN2", "MAN3", "MAN4", "MME1", "MME2", "NCL1", "PED1", "SOU1", "STN1", "SWN1", "TIL1", "XUKA", "XUKB", "XUKC", "XUKD", "XUKE", "XUKF", "XUKG", "XUKH", "XUKI", "XUKJ", "XUKK", "XUKL", "XUKM", "XUKN", "XUKO", "XUKP", "XUKQ", "XUKR", "XUKS", "XUKT", "XUKU", "XUKV", "XUKW", "XUKX", "XUKY", "XUKZ", "LPL1"], "SC": ["DSC1", "DSC2", "DSC3"], "IXD": ["IXD1"], "ATS": ["ATSF"] } }, "CE": { "PL": { "FC": ["KTW1", "LCJ1", "LCJ2", "LCJ3", "POZ1", "POZ2", "SZZ1", "WRO1", "WRO2", "WRO3", "WRO4"], "SC": ["DSZ1", "DSZ2"], "IXD": ["IXDPL"], "AMZL": ["WAW1", "KRK1", "WRO5", "LOD1"] }, "CZ": { "FC": ["PRG1", "PRG2"], "SC": ["DSCZ"], "IXD": ["IXDCZ"] }, "DE": { "FC": ["BER3", "BER6", "BEY8", "CGN1", "DTM1", "DTM2", "DUS2", "DUS4", "EDE4", "EDE5", "FRA1", "FRA3", "FRA7", "HAM2", "HAU2", "LEJ1", "LEJ2", "LEJ3", "LEJ5", "MUC3", "PAD1", "PAD2", "STR1", "WRO5", "XDEB", "XDEC", "XDED", "XDEE", "XDEF", "XDEG", "XDEH", "XDEI", "XDEJ", "XDEK", "XDEL", "XDEM", "XDEN", "XDEO", "XDEP", "XDEQ", "XDER", "XDES", "XDET", "XDEU", "XDEV", "XDEW", "XDEX", "XDEY", "XDEZ", "XDEZA"], "SC": ["DEDS"], "IXD": ["IXDDE"] } }, "SEU": { "FR": { "FC": ["ORY1", "ORY4", "LIL1", "LYS1", "MRS1", "MRS3", "BVA1", "CDG7"], "SC": ["DSF1", "DSF2"], "IXD": ["IXDFR"] }, "IT": { "FC": ["FCO1", "FCO2", "FCO5", "MXP3", "MXP5", "TRN1"], "SC": ["DIT1", "DIT2"], "IXD": ["IXDIT"] }, "ES": { "FC": ["BCN1", "BCN2", "BCN3", "BCN8", "MAD4", "MAD6", "MAD8", "SVQ1"], "SC": ["DES1", "DES2"], "IXD": ["IXDES"] } } };
    let siteAttributes = {};
    for (const [region, countries] of Object.entries(siteDictionary)) {
        for (const [country, types] of Object.entries(countries)) {
            for (const [type, sites] of Object.entries(types)) {
                sites.forEach(site => { siteAttributes[site] = { region, country, type }; });
            }
        }
    };
    const categoriesDictionary = { "General": { "Carrier Raised": { "Lateness": { "My truck is late": ["", "Hello All - @Carrier, What is your ETA?", { "snooze": 0.5, "status": "Pending Carrier Action" }], "Traffic": ["", "Hello All - @Carrier, What is your ETA?", { "snooze": 0.5, "status": "Pending Carrier Action" }], "Breakdown": ["", "Hello All - @Carrier, What is your ETA?", { "snooze": 0.5, "status": "Pending Carrier Action" }] }, "Arrival": { "Arrived": ["", "Hello All - VRID has arrived", {}] } } } };
    const buttonActions = generateButtonActions(categoriesDictionary);

    // --- ADDED: Functions for Search Functionality ---
    function generateButtonActions(categoriesDict) {
        const actions = [];
        for (const [category, subcats] of Object.entries(categoriesDict)) {
           for (const [subcategory, topics] of Object.entries(subcats)) {
                const raisedBy = subcategory.toLowerCase().includes('site') ? 'Site' : subcategory.toLowerCase().includes('carrier') ? 'Carrier' : 'Other';
                const siteInput = raisedBy === 'Site';
                for (const [topic, blurbs] of Object.entries(topics)) {
                   for (const [blurbName, blurbData] of Object.entries(blurbs)) {
                        const settings = blurbData[2] || {};
                        actions.push({
                            category, subcategory, topic, blurbName, sop: blurbData[0], blurb: blurbData[1], raisedBy, siteInput,
                            snooze: settings.snooze || null, status: settings.status || null
                        });
                   }
                }
            }
        }
        return actions;
    }

    function searchActions(query) {
        if (!query) return [];
        const searchTerms = query.toLowerCase().trim().split(/\s+/);
        return buttonActions.filter(action => {
            const searchableText = [action.category, action.subcategory, action.topic, action.blurbName, action.sop, action.blurb].map(text => (text || '').toLowerCase()).join(' ');
            return searchTerms.every(term => searchableText.includes(term));
        });
    }

    function buildSubject(site, topic) {
        const attr = siteAttributes[site] || {};
        if (attr.region === 'UK') {
            return `★ [${attr.country || ''}][${site}][${attr.type || ''}] ${topic} ★`;
        }
        return `★ [${attr.region || ''}][${attr.country || ''}][${site}][${attr.type || ''}] ${topic} ★`;
    }

    // ========== DOM & ACTION HELPERS ==========
    function applyStyles(element, styles) { Object.assign(element.style, styles); }
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    function getElement(doc, path) { return document.evaluate(path, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; }
    function getAddSubjectIframe() { return getElement(document, "//iframe[contains(@class, 'resolution-widget-container')]"); }
    function getAddSubjectIframeDoc() {
        const iframe = getAddSubjectIframe();
        return iframe ? (iframe.contentDocument || iframe.contentWindow.document) : null;
    }
    function getAddSubject() { const doc = getAddSubjectIframeDoc(); return doc ? getElement(doc, "//input[@placeholder='Add to subject']") : null; }
    function getCategory() { const doc = getAddSubjectIframeDoc(); return doc ? getElement(doc, "//select[@name='category']") : null; }
    function getReplyTextbox() { const doc = getAddSubjectIframeDoc(); return doc ? getElement(doc, "//textarea[@placeholder='Reply to this case...']") : null; }
    function getStatusDropdown() { const doc = getAddSubjectIframeDoc(); return doc ? getElement(doc, "//select[@name='status']") : null; }
    function getFollowUpDatetime() { const doc = getAddSubjectIframeDoc(); return doc ? getElement(doc, "//input[@name='dueDate' and @type='datetime-local']") : null; }
    function getReplyButton() { const doc = getAddSubjectIframeDoc(); return doc ? getElement(doc, "//a[text()='Case Reply']") : null; }
    function getFollowUpButton() { return getElement(getAddSubjectIframeDoc(), "//a[text()='Case Follow Up']"); };

    function setReactInputValue(input, value) {
        if (!input) return;
        let lastValue = input.value;
        input.value = value;
        let event = new Event('input', { bubbles: true });
        event.simulated = true;
        let tracker = input._valueTracker;
        if (tracker) tracker.setValue(lastValue);
        input.dispatchEvent(event);
    }
    function setReactSelectValue(selectElement, newValue) {
        if (!selectElement) return;
        let setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
        setter.call(selectElement, newValue);
        const event = new Event('change', { bubbles: true });
        selectElement.dispatchEvent(event);
    }

    /**
     * Handles actions for the Quick Buttons.
     */
    async function handleQuickButtonAction(action) {
        try {
            // Ensure the reply section is open before proceeding.
            if (!getReplyTextbox()) {
                const replyButton = getReplyButton();
                if (replyButton) {
                    replyButton.click();
                    await delay(300);
                }
            }

            if (action.category) setReactSelectValue(getCategory(), action.category);

            // Add star formatting here to prevent double-stars
            if (action.topic) {
                setReactInputValue(getAddSubject(), `★ ${action.topic} ★`);
            }

            if (action.blurb) setReactInputValue(getReplyTextbox(), action.blurb);
            if (action.status) setReactSelectValue(getStatusDropdown(), action.status);

            if (action.snooze) {
                if (!getFollowUpDatetime()) {
                   const followUpButton = getFollowUpButton();
                   if (followUpButton) {
                        followUpButton.click();
                        await delay(300);
                   }
                }
                const followUpDatetime = getFollowUpDatetime();
                if (followUpDatetime) {
                    let date = new Date();
                    date.setTime(date.getTime() + action.snooze * 60 * 60 * 1000);
                    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                    setReactInputValue(followUpDatetime, formattedDate);
                }
            }
            showPopup(`Applied: ${action.topic || 'Quick Action'}`);
        } catch (error) {
            console.error('CamPRO: Error applying quick action:', error);
            showPopup('Error applying action. Please try again.', true);
        }
    }

    // --- ADDED: Action Handler for Search Results ---
    async function handleSearchButtonAction(action) {
        try {
            let subject = action.topic;
            if (action.siteInput) {
                const site = prompt("Enter site code (e.g. BHX1):");
                if (!site) return;
                subject = buildSubject(site.toUpperCase(), action.topic);
            } else {
                subject = `★ ${action.topic} ★`;
            }

            if (!getReplyTextbox()) {
                const replyButton = getReplyButton();
                if (replyButton) {
                    replyButton.click();
                    await delay(300);
                }
            }

            setReactSelectValue(getCategory(), action.category);
            setReactInputValue(getAddSubject(), subject);
            setReactInputValue(getReplyTextbox(), action.blurb);
            if(action.status) setReactSelectValue(getStatusDropdown(), action.status);

            if (action.snooze) {
                 if (!getFollowUpDatetime()) {
                   const followUpButton = getFollowUpButton();
                   if (followUpButton) {
                        followUpButton.click();
                        await delay(300);
                   }
                }
                const followUpDatetime = getFollowUpDatetime();
                if (followUpDatetime) {
                    let date = new Date();
                    date.setTime(date.getTime() + action.snooze * 60 * 60 * 1000);
                    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                    setReactInputValue(followUpDatetime, formattedDate);
                }
            }
            showPopup(`Applied: ${subject}`);
        } catch (error) {
            console.error('CamPRO: Error applying search action:', error);
            showPopup('Error applying action. Please try again.', true);
        }
    }


    // ========== UI CREATION ==========
    function showPopup(message, isError = false) {
        const existingPopup = document.querySelector('.wims-enhancer-popup');
        if (existingPopup) existingPopup.remove();
        const popup = document.createElement('div');
        popup.className = 'wims-enhancer-popup';
        applyStyles(popup, {
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '35px',
            background: '#000000', color: '#ffffff', borderLeft: isError ? '4px solid #F44336' : '4px solid #2196F3',
            borderRadius: '4px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', zIndex: '9999', fontFamily: 'Arial, sans-serif',
            minWidth: '400px', maxWidth: '800px', fontSize: '16px', transition: 'opacity 0.5s'
        });
        popup.textContent = message;
        document.body.appendChild(popup);
        setTimeout(() => {
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 500);
        }, 2000);
    }

    function injectSnoozeButtons() {
        const maxAttempts = 20;
        let attempt = 0;
        const interval = setInterval(() => {
            const replyTextbox = getReplyTextbox();
            if (replyTextbox) {
                clearInterval(interval);
                const snoozeContainer = document.createElement('div');
                Object.assign(snoozeContainer.style, { display: 'flex', justifyContent: 'flex-start', gap: '6px', marginBottom: '8px' });
                const snoozeButtons = [ { label: '15m', hours: 0.25 }, { label: '30m', hours: 0.5 }, { label: '1h', hours: 1 }, { label: '2h', hours: 2 }, { label: '4h', hours: 4 }, { label: '8h', hours: 8 }];
                snoozeButtons.forEach(({ label, hours }) => {
                    const button = document.createElement('button');
                    button.textContent = label;
                    button.title = `Snooze for ${label}`;
                    applyStyles(button, { padding: '4px 8px', background: '#444', color: '#fff', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' });
                    button.onclick = async (e) => {
                        e.preventDefault();
                        if (!getFollowUpDatetime()) {
                            const followUpButton = getFollowUpButton();
                            if (followUpButton) {
                                followUpButton.click();
                                await delay(300);
                            }
                        }
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
                replyTextbox.parentElement.insertBefore(snoozeContainer, replyTextbox);
            } else {
                attempt++;
                if (attempt > maxAttempts) {
                    clearInterval(interval);
                    console.error('CamPRO: Could not find reply textbox to inject snooze buttons.');
                }
            }
        }, 500);
    }

    function createMainContainer() {
        const container = document.createElement('div');
        applyStyles(container, CONTAINER_STYLES);

        const buttonsFlexContainer = document.createElement('div');
        applyStyles(buttonsFlexContainer, {
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: '15px',
            width: '100%',
        });
        container.appendChild(buttonsFlexContainer);

        const standardButtons = quickButtons.filter(b => b.action.type !== 'Transfer');
        const transferButtons = quickButtons.filter(b => b.action.type === 'Transfer');

        const standardButtonGrid = document.createElement('div');
        applyStyles(standardButtonGrid, { display: 'flex', flexWrap: 'wrap', justifyContent: 'left', width: '65%' });
        buttonsFlexContainer.appendChild(standardButtonGrid);

        const transferGroup = document.createElement('fieldset');
        applyStyles(transferGroup, { border: '1px solid #777', borderRadius: '5px', padding: '10px 5px 5px 5px', minWidth: '200px' });
        const transferLegend = document.createElement('legend');
        transferLegend.textContent = 'Transfers';
        applyStyles(transferLegend, { padding: '0 5px', color: '#ccc', fontSize: '12px', textAlign: 'center', width: 'auto' });
        transferGroup.appendChild(transferLegend);
        const transferButtonGrid = document.createElement('div');
        applyStyles(transferButtonGrid, { display: 'flex', flexWrap: 'wrap', justifyContent: 'center' });
        transferGroup.appendChild(transferButtonGrid);
        buttonsFlexContainer.appendChild(transferGroup);

        const createButton = (buttonDef, parentGrid) => {
            const button = document.createElement('button');
            button.innerHTML = buttonDef.name.replace(/ (-|S|C)$/, '<br>$1').replace(' ', '<br>');
            button.title = buttonDef.label;
            applyStyles(button, QUICK_BUTTON_STYLES);

            if (buttonDef.isParent) {
                const childrenContainer = document.createElement('div');
                childrenContainer.id = `children-container-${buttonDef.name.replace(/ /g, '')}`;
                applyStyles(childrenContainer, { display: 'none', position: 'absolute', bottom: '150px', left: '50%', transform: 'translateX(-50%)', background: '#2a2a2a', padding: '5px', borderRadius: '5px', boxShadow: '0 -2px 10px rgba(0,0,0,0.5)', zIndex: '9999', gap: '5px' });

                buttonDef.children.forEach(childDef => {
                    const childButton = document.createElement('button');
                    childButton.textContent = childDef.label;
                    childButton.title = childDef.label;
                    applyStyles(childButton, QUICK_BUTTON_STYLES);
                    Object.assign(childButton.style, { width: 'auto', padding: '8px 12px', whiteSpace: 'nowrap' });
                    childButton.onclick = () => {
                        handleQuickButtonAction(childDef.action);
                        childrenContainer.style.display = 'none';
                    };
                    childrenContainer.appendChild(childButton);
                });
                document.body.appendChild(childrenContainer);

                button.onclick = () => {
                    const isHidden = childrenContainer.style.display === 'none';
                    document.querySelectorAll('[id^=children-container]').forEach(c => { c.style.display = 'none'; });
                    childrenContainer.style.display = isHidden ? 'flex' : 'none';
                };
            } else {
                button.onclick = () => handleQuickButtonAction(buttonDef.action);
            }
            parentGrid.appendChild(button);
        };

        standardButtons.forEach(btn => createButton(btn, standardButtonGrid));
        transferButtons.forEach(btn => createButton(btn, transferButtonGrid));

        // --- ADDED: Search UI Elements ---
        const searchBox = document.createElement('input');
        searchBox.type = 'text';
        searchBox.placeholder = 'Search categories, topics, blurbs...';
        applyStyles(searchBox, {
            width: '35%',
            minWidth: '200px',
            padding: '8px 12px',
            border: '1px solid #444',
            borderRadius: '4px',
            background: '#333',
            color: '#fff',
            position: 'absolute',
            right: '20px',
            bottom: '5px',
            height: '36px'
        });
        container.appendChild(searchBox);

        const searchResultsContainer = document.createElement('div');
        applyStyles(searchResultsContainer, {
            display: 'none',
            flexDirection: 'column-reverse',
            gap: '4px',
            width: '30%',
            minWidth: '200px',
            maxHeight: '160px',
            overflowY: 'auto',
            position: 'absolute',
            right: '20px',
            bottom: '45px', // Position above the search bar
            background: '#1f1f1f',
            borderRadius: '4px',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
            zIndex: '9999'
        });
        container.appendChild(searchResultsContainer);

        searchBox.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            searchResultsContainer.innerHTML = '';
            if (query) {
                searchResultsContainer.style.display = 'flex';
                const results = searchActions(query);
                results.forEach(action => {
                    const button = document.createElement('button');
                    button.textContent = `${action.subcategory} > ${action.topic} > ${action.blurbName}`;
                    applyStyles(button, SEARCH_BUTTON_STYLES);
                    Object.assign(button.style, { width: '100%', height: 'auto', minHeight: '40px', padding: '8px 12px'});
                    button.onclick = () => {
                        handleSearchButtonAction(action);
                        searchResultsContainer.style.display = 'none'; // Hide results after click
                    };
                    searchResultsContainer.appendChild(button);
                });
            } else {
                searchResultsContainer.style.display = 'none';
            }
        });


        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = '▲';
        toggleBtn.style = 'position:absolute;right:8px;top:-28px;background:#444;color:#fff;border:none;border-radius:4px 4px 0 0;padding:4px 12px;cursor:pointer;z-index:10001;';
        let hidden = false;
        toggleBtn.onclick = () => {
            hidden = !hidden;
            container.style.transform = hidden ? 'translateY( calc(100% - 30px) )' : 'translateY(0)';
            toggleBtn.textContent = hidden ? '▼' : '▲';
        };
        container.appendChild(toggleBtn);
        document.body.appendChild(container);
    }

    // ========== INIT ==========
    function init() {
        createMainContainer();
        injectSnoozeButtons();
        console.log('CamPRO Enhanced WIMS Interface: Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
