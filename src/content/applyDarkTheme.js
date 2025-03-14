main();
async function main() {
  const response = await chrome.storage.sync.get("basicUI");
  const useDarkTheme = response.basicUI && response.basicUI.useDarkTheme;

  if (!useDarkTheme) {
    return;
  }

  applyDarkTheme();
}

function applyDarkTheme() {
  const style = document.createElement("style");
      
  const ICON_IMAGE_LINK = chrome.runtime.getURL("images/darkThemeIcons.png");

  const hoverColor = "#19344F";
  const centerColor = "rgb(15, 32, 48)";
  const sidebarColor = "rgb(19 40 62)";

  style.innerHTML = `
      .sidebar-theme {
          background-color: ${sidebarColor} !important;
      }

      .q_ZW7CQC { /* yahoo top page color */
          background: linear-gradient(60deg, #350090, #2b3567, #211e45) !important;
      }

      .center-view-theme {
          background-color: ${centerColor} !important;
      }

      .V_GM.I_Z1sX2Gk.n_Z14vXdP { /* right side bar */
        background-color: ${sidebarColor} !important;
      }

      .V_GM.I_Z1sX2Gk.x_Z14vXdP.W_3rdfm { /* left side bar */
        background-color: ${sidebarColor} !important;
      }

      a:link, a:visited { /* all (a) text, not !important */
          color: white;
      }

      .f_l { /* "Folders" text on left sidebar */
          color: white;
      }

      tr.i_6UHk.A_6EqO.I4_ZnMI27:hover { /* hover email color on allemail view */
          background-color: ${hoverColor} !important;
      }

      a#quotedTextHide { /* "Show/Hide original message" when sending email */
        color: black;
      }

      a#quotedTextShow { /* "Show/Hide original message" when sending email */
        color: black !important;
      }

      a.compose-toolbar-cancel { /* "Cancel compose" when sending */
        color: black !important;
      }
      .o_A.d_3zJDR.H_3zJDR { /* sending email content */
        min-height: 60vh !important;
      }

      .A_6EWk.P_2jIBWi.o_h.I4_ZrEPFE:hover { /* mailbox hover */
          background-color: ${hoverColor} !important;
      }

      .A_6EqO.P_2jIBWi.o_h.I4_ZrEPFE:hover { /* main folders (inbox, etc) hover */
          background-color: ${hoverColor} !important;
      }

      .P_2aKN71.I_Z1sX2Gk.o_h {  /* main folder color in sending email page */
        background-color: ${sidebarColor} !important;
      }

      a.A_6EqO.Q_6DEy.o_h.G_e.P_3LQ7g.D_B.I_T.I4_ZrEPFE:hover { /* "New folder" hover in sidebar */
          background-color: ${hoverColor} !important;
      }

      .u_b { /* unread emails bolder */
          font-weight: 750 !important;
      }

      body {
          scrollbar-color: #32485e #1e1e1e; /* scrollbar color */
      }

      button[value=markAsSpam] { /* Spam in allemail view */
          color: white !important;
      }

      button[value=moveToFolder] { /* Delete text in allemail view */
          color: white !important;
      }

      button[value=markAsNotSpam] { /* Not Spam in all spam view */
          color: white !important;
      }

      .q_ZsN8VL { /* current folder highlight */
          background: ${hoverColor} !important;
      }

      span[data-test-id=pageNumber] { /* page number in allemail view */
          color: white;
      }

      .c26zcWk_I { /* Reply, Reply All, Forward in content page */
          color: white !important;
      }

      .M_Z4bbOy.P_0.A_6FsP.t_l.C_Z281SGl.Y_fq7.U_6Eb4.I_ZkbNhI.W_6D6F {
          color: white !important;
          background-color: ${centerColor} !important;
      }

      span#nodin-inbox-pill { /* unread mail number in inbox left panel */
          color: white !important;
      }

      .email-received-label {
          color: white;
      }
  `;

  // update icons to dark theme
  style.innerHTML += `
      #Atom .q_Z1dv4XS {
      background: url(${ICON_IMAGE_LINK}) 0 -220px no-repeat !important
      }

      #Atom .q4_Z2pwHDv:hover {
      background: url(${ICON_IMAGE_LINK}) 0 -240px no-repeat !important
      }

      #Atom .q_1sCMuN {
      background: url(${ICON_IMAGE_LINK}) 0 -260px no-repeat !important
      }

      #Atom .q4_gB9Pb:hover {
      background: url(${ICON_IMAGE_LINK}) 0 -280px no-repeat !important
      }

      #Atom .q_19TPEI {
      background: url(${ICON_IMAGE_LINK}) 0 -1360px no-repeat !important
      }

      #Atom .q4_1rFlMJ:hover {
      background: url(${ICON_IMAGE_LINK}) 0 -1400px no-repeat !important
      }

      #Atom .q_Z26LYT {
      background: url(${ICON_IMAGE_LINK}) 0 -1380px no-repeat !important
      }

      #Atom .q_ZtaR9B {
      background: url(${ICON_IMAGE_LINK}) 0 -20px no-repeat !important
      }

      #Atom .q4_24NiRX:hover,#Atom .q_24NiRX {
      background: url(${ICON_IMAGE_LINK}) 0 -120px no-repeat !important
      }

      #Atom .q_23tTMg {
      background: url(${ICON_IMAGE_LINK}) 0 -380px no-repeat !important
      }

      #Atom .q_Z1vgA6T {
      background: url(${ICON_IMAGE_LINK}) 0 -180px no-repeat !important
      }

      #Atom .q4_Z1trjg:hover {
      background: url(${ICON_IMAGE_LINK}) 0 -200px no-repeat !important
      }

      #Atom .q_RLFdl {
      background: url(${ICON_IMAGE_LINK}) 0 -140px no-repeat !important
      }

      #Atom .q4_ZjeWrh:hover {
      background: url(${ICON_IMAGE_LINK}) 0 -160px no-repeat !important
      }

      #Atom .q_Z1gsXbI {
      background: url(${ICON_IMAGE_LINK}) 0 -700px no-repeat !important
      }

      #Atom .q4_dDgCl:hover {
      background: url(${ICON_IMAGE_LINK}) 0 -760px no-repeat !important
      }

      #Atom .q_ZFBPTg {
      background: url(${ICON_IMAGE_LINK}) 0 -820px no-repeat !important
      }

      #Atom .q4_NunTN:hover {
      background: url(${ICON_IMAGE_LINK}) 0 -880px no-repeat !important
      }

      #Atom .q_Z2suAQl {
      background: url(${ICON_IMAGE_LINK}) 0 -720px no-repeat !important
      }

      #Atom .q4_ZXnm2h:hover {
      background: url(${ICON_IMAGE_LINK}) 0 -780px no-repeat !important
      }

      #Atom .q_Z1RDtyS {
      background: url(${ICON_IMAGE_LINK}) 0 -840px no-repeat !important
      }

      #Atom .q4_2ihwHr:hover {
      background: url(${ICON_IMAGE_LINK}) 0 -900px no-repeat !important
      }

      #Atom .q_1pEThX {
      background: url(${ICON_IMAGE_LINK}) 0 -740px no-repeat !important
      }

      #Atom .q4_voLKm:hover {
      background: url(${ICON_IMAGE_LINK}) 0 -800px no-repeat !important
      }

      #Atom .q_20w1zq {
      background: url(${ICON_IMAGE_LINK}) 0 -860px no-repeat !important
      }

      #Atom .q4_16fT2O:hover {
      background: url(${ICON_IMAGE_LINK}) 0 -920px no-repeat !important
      }

      #Atom .q_Z2tNYW3 {
      background: url(${ICON_IMAGE_LINK}) 0 -980px no-repeat !important
      }

      #Atom .q4_Z1MF8Qh:hover {
      background: url(${ICON_IMAGE_LINK}) 0 -1020px no-repeat !important
      }

      #Atom .q_SsICp {
      background: url(${ICON_IMAGE_LINK}) 0 -1060px no-repeat !important
      }

      #Atom .q_ZADvbE {
      background: url(${ICON_IMAGE_LINK}) 0 -1000px no-repeat !important
      }

      #Atom .q4_25umi2:hover {
      background: url(${ICON_IMAGE_LINK}) 0 -1040px no-repeat !important
      }

      #Atom .q_ZixT2d {
      background: url(${ICON_IMAGE_LINK}) 0 -1080px no-repeat !important
      }

      #Atom .q_ONM0v {
      background: url(${ICON_IMAGE_LINK}) 0 -620px no-repeat !important
      }

      #Atom .q4_Z1yetjJ:hover {
      background: url(${ICON_IMAGE_LINK}) 0 -660px no-repeat !important
      }

      #Atom .q_ZmcPE7 {
      background: url(${ICON_IMAGE_LINK}) 0 -640px no-repeat !important
      }

      #Atom .q4_2jV1Oz:hover {
      background: url(${ICON_IMAGE_LINK}) 0 -680px no-repeat !important
      }

      #Atom .q4_21PpF8:hover,#Atom .q_21PpF8 {
      background: url(${ICON_IMAGE_LINK}) 0 -600px no-repeat !important
      }

      #Atom .q4_Z1eOt4A:hover,#Atom .q_Z1eOt4A {
      background: url(${ICON_IMAGE_LINK}) 0 -480px no-repeat !important
      }

      #Atom .q_ZW3WVz {
      background: url(${ICON_IMAGE_LINK}) 0 -520px no-repeat !important
      }

      #Atom .q_Z1wU5e2 {
      background: url(${ICON_IMAGE_LINK}) 0 -400px no-repeat !important
      }

      #Atom .q4_x3gRu:hover,#Atom .q_x3gRu {
      background: url(${ICON_IMAGE_LINK}) 0 -580px no-repeat !important
      }

      #Atom .q4_Z2MPoX:hover,#Atom .q_Z2MPoX {
      background: url(${ICON_IMAGE_LINK}) 0 -460px no-repeat !important
      }

      #Atom .q_eWEI3 {
      background: url(${ICON_IMAGE_LINK}) 0 -500px no-repeat !important
      }

      #Atom .q_ymEXc {
      background: url(${ICON_IMAGE_LINK}) 0 -320px no-repeat !important
      }

      #Atom .q4_Z1OFAm3:hover {
      background: url(${ICON_IMAGE_LINK}) 0 -360px no-repeat !important
      }

      #Atom .q_Z1cO1yO {
      background: url(${ICON_IMAGE_LINK}) 0 -1140px no-repeat !important
      }

      #Atom .q_z3Ing {
      background: url(${ICON_IMAGE_LINK}) 0 -1240px no-repeat !important
      }

      #Atom .q_ZBWThm {
      background: url(${ICON_IMAGE_LINK}) 0 -1260px no-repeat !important
      }

      #Atom .q_1tjPTR {
      background: url(${ICON_IMAGE_LINK}) 0 -1180px no-repeat !important
      }
      `;

  document.documentElement.append(style);
  console.log("[BY] dark theme applied");
}