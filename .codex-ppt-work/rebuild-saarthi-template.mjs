import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const workspaceDir = 'C:/Users/hardi/Coding All Programs/mahakumbh';
const workDir = path.join(workspaceDir, '.codex-ppt-work');
const referenceDir = path.join(workDir, 'reference');
const screenshotDir = path.join(workDir, 'screenshots');
const draftDir = path.join(workDir, 'saarthi-revision');
const sourcePdf = 'D:/Downloads/SAARTHI_AI_Presentation.pptx.pdf';
const outputPath = path.join(workspaceDir, 'output', 'pptx', 'KumbhRakshak_PBL_SAARTHI_Template_Final_2026-10-03.pptx');
const skillDir = 'C:/Users/hardi/.codex/plugins/cache/openai-primary-runtime/presentations/26.904.11930/skills/presentations';
const runtimePython = 'C:/Users/hardi/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
process.env.RUNTIME_NODE_MODULES = 'C:/Users/hardi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const modulePath = 'C:/Users/hardi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const { Presentation, PresentationFile } = await import(pathToFileURL(modulePath).href);
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, 'container_tools/artifact_tool_utils.mjs')).href);
await fs.mkdir(draftDir, { recursive: true });
await fs.mkdir(path.dirname(outputPath), { recursive: true });

const deck = Presentation.create({ slideSize: { width: 1440, height: 810 } });
const C = { white:'#FFFFFF', red:'#921E27', bright:'#C80000', navy:'#202B49', text:'#1F2B48', gold:'#D5A819', pale:'#FBF6F6', gray:'#666666' };

async function makeSlide(page) {
  const slide = deck.slides.add();
  const bg = await fs.readFile(path.join(referenceDir, `saarthi-${String(page).padStart(2,'0')}.png`));
  slide.images.add({blob:new Uint8Array(bg),contentType:'image/png',alt:`Original SAARTHI slide ${page} background`,fit:'fill',position:{left:0,top:0,width:1440,height:810}});
  return slide;
}
function box(s,x,y,w,h,fill=C.white){s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:'none',width:0}});}
function txt(s,value,x,y,w,h,size=20,color=C.text,bold=false,align='left',font='Calibri'){
  const o=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
  o.text=value;
  o.text.style={typeface:font,fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',autoFit:'shrinkText'};
  return o;
}
function title(s,value,x=180,y=138,w=1050){txt(s,value,x,y,w,62,45,C.red,true,'left','Cambria');}
function note(s,value){s.speakerNotes.textFrame.setText(value);}
async function shot(s,file,x,y,w,h,alt){const b=await fs.readFile(path.join(screenshotDir,file));s.images.add({blob:new Uint8Array(b),contentType:'image/png',alt,fit:'contain',position:{left:x,top:y,width:w,height:h}});}

// 1. The source's two-tone red border and Somaiya branding stay as the full-slide background.
{
  const s=await makeSlide(1);box(s,75,150,1300,410);
  txt(s,'Department of Artificial Intelligence & Data Science',300,155,950,28,22,C.text,true,'center','Cambria');
  txt(s,'Academic Year 2025-26',460,202,630,26,20,C.text,true,'center','Cambria');
  txt(s,'KumbhRakshak',270,250,1050,45,35,C.red,true,'center','Cambria');
  txt(s,'Safety and Decision Support for Nashik-Trimbakeshwar',250,295,1090,38,26,C.red,false,'center','Cambria');
  txt(s,'Hardik Sedani T8-70  |  Shubham Vishwakarma T5-13',300,449,1020,30,20,C.red,false,'center','Cambria');
  note(s,'This is a project prototype presentation. It does not claim approval or operational use by the Maharashtra authorities.');
}

// 2. The reference outline exactly suits the academic structure, so its composition is untouched.
{const s=await makeSlide(2);note(s,'The screenshots of the working website appear in the implementation, results and 3D place guide sections.');}

// 3. Introduction: retain the five red value cards and the original photo footprint.
{
  const s=await makeSlide(3);box(s,180,207,818,385);box(s,1014,198,408,350);
  txt(s,'KumbhRakshak',190,210,790,31,22,C.red,true);
  txt(s,'A place-linked command-centre prototype for the upcoming Nashik-Trimbakeshwar Simhastha.',190,248,780,55,22,C.text);
  for(const [t,y] of [
    ['Shows locations, crowd indicators and incident information together',315],
    ['Uses a 3D guide to explain where ghats and facilities belong',378],
    ['Links each place to its relevant monitoring or response portal',441],
    ['Requires official GIS, live feeds and validation before field use',504],
  ]) txt(s,'•  '+t,224,y,740,49,20,C.text);
  await shot(s,'overview.png',1017,201,400,340,'KumbhRakshak overview screenshot');
  note(s,'Website screenshot captured from the local project demo on 3 October 2026. Indicators are simulated.');
}

// 4. Problem Definition: preserve the five-step journey, icons, arrows and four lower cards.
{
  const s=await makeSlide(4);
  box(s,177,217,1225,43);
  txt(s,'A large event needs clear place context when crowd, camera and public reports arrive separately.',182,223,1200,30,20,C.gray,false,'left','Calibri');
  box(s,615,355,174,66,'#901E29');
  txt(s,'Ghat',617,358,170,28,19,C.white,true,'center');
  txt(s,'Crowd bottlenecks',620,389,165,24,16,C.white,false,'center');
  const problems=[
    [192,'Unclear links between ghats, routes and relevant portals'],
    [470,'Crowd and incident inputs arrive in separate views'],
    [751,'Unverified posts can spread during an event'],
    [1039,'Human approval and clear context remain essential'],
  ];
  for(const [x,b] of problems){box(s,x,565,206,70,C.pale);txt(s,b,x+3,568,198,63,15,C.text);}
  box(s,160,651,1280,69,C.navy);
  txt(s,'Research Gap:',181,668,180,27,19,C.gold,true);
  txt(s,'A place-linked view that connects signals, facilities and human response is missing from many tools.',359,668,1030,31,19,C.white);
  note(s,'Original visitor journey cards are retained as contextual problem framing. The project solution is a prototype.');
}

// 5. Objectives: retain numbered crimson icons and exact two-column spacing.
{
  const s=await makeSlide(5);
  const entries=[
    [308,263,560,63,'Show Nashik and Trimbakeshwar landmarks in an interactive 3D guide'],
    [308,404,560,63,'Connect each landmark to the related crowd, map or response portal'],
    [308,544,560,63,'Surface crowd pressure and incident signals for human review'],
    [308,682,560,53,'Explain demo data and unverified information clearly'],
    [981,263,425,63,'Bring many project features into one understandable website'],
    [981,404,425,63,'Support claim review before public communication'],
    [981,544,425,63,'Prepare for GIS and live-feed integration after validation'],
  ];
  for(const [x,y,w,h,v] of entries){box(s,x-3,y-2,w+4,h+4);txt(s,v,x,y,w,h,19,C.text);}
}

// 6. Literature Survey: same table grid and alternating row palette, revised project relevance.
{
  const s=await makeSlide(6);box(s,846,0,594,142);title(s,'Literature Survey',848,35,530);
  txt(s,'Research on Kumbh safety, crowd analysis and digital reporting informs this prototype.',849,86,565,45,17,C.gray);
  box(s,996,145,443,40,C.red);txt(s,'Relevance to KumbhRakshak',1003,153,420,28,17,C.white,true);
  const rowY=[186,269,353,423,495,569,644,758];
  const vals=[
    'Sets the real-world safety and coordination context',
    'Supports camera-based crowd observation as a future input',
    'Shows density estimation can help zone-level review',
    'Motivates forecasts, but field accuracy must be tested',
    'Explains risk around ghat pedestrian bottlenecks',
    'Supports accessibility-aware place guidance',
    'Motivates human review of public reports and claims',
  ];
  for(let i=0;i<7;i++){box(s,997,rowY[i],441,rowY[i+1]-rowY[i]-1,i%2?C.pale:C.white);txt(s,vals[i],1006,rowY[i]+8,419,rowY[i+1]-rowY[i]-14,16,C.text);}
}

// 7. Findings: keep the five icon circles and dark research-gap banner.
{
  const s=await makeSlide(7);
  const vals=[
    'Kumbh studies show the scale of crowd coordination and safety planning.',
    'Vision research supports crowd counting, but site-specific validation is essential.',
    'Forecasting can aid early review when reliable local data is available.',
    'Accessible navigation research informs a future verified route layer.',
    'Fast-moving online claims require evidence and human approval before response.',
  ];
  const ys=[229,312,393,475,555];
  for(let i=0;i<5;i++){box(s,257,ys[i],1162,65);txt(s,vals[i],259,ys[i]+1,1138,58,20,C.text);}
  box(s,176,649,1243,103,C.navy);txt(s,'Confirmed Research Gap',205,653,510,32,20,C.gold,true);
  txt(s,'KumbhRakshak brings place context, monitoring views and response workflows together. Field validation remains necessary.',205,688,1166,53,18,C.white);
}

// 8. Requirements: preserve icons and two-column visual rhythm.
{
  const s=await makeSlide(8);
  const sw=[
    'Frontend: Next.js, React, Three.js', 'Backend: FastAPI and WebSockets',
    'Data: Firestore adapter, demo memory mode', 'AI: vision, claim and crowd modules',
    'Maps: Mapbox GL and OpenStreetMap', 'Tools: Docker, Git, VS Code',
  ];
  const hw=[
    'Camera feeds: permissioned sources only', 'Operator laptop or server: 8-16 GB RAM',
    'Phones: browsers for field access', 'Network: reliable and secured APIs',
    'GIS: official ghat and facility coordinates',
  ];
  box(s,281,264,591,438);box(s,979,260,449,441);
  const sy=[273,351,432,506,584,649],hy=[268,350,431,510,590];
  sw.forEach((v,i)=>{box(s,283,sy[i],590,56);txt(s,v,286,sy[i]+5,575,45,18,C.text);});
  hw.forEach((v,i)=>{box(s,980,hy[i],435,65);txt(s,v,985,hy[i]+3,420,54,18,C.text);});
  box(s,195,704,1216,58,C.pale);txt(s,'A live deployment needs official data access, security review and field testing.',212,719,1165,35,19,C.red,false,'left','Calibri');
}

// 9. System Design: the reference's colored architecture cards remain intact.
{
  const s=await makeSlide(9);
  const top=[
    {x:253,w:310,title:'Public Interface',body:'Place guide, advisories and reports'},
    {x:693,w:278,title:'Field Interface',body:'Observations and incident support'},
    {x:1100,w:270,title:'Operator Dashboard',body:'Crowd, cameras and human decisions'},
  ];
  for(const v of top){box(s,v.x,260,v.w,100,C.red);txt(s,v.title,v.x,263,v.w,31,18,C.white,true,'center');txt(s,v.body,v.x+7,309,v.w-14,44,15,C.white,false,'center');}
  const low=[
    [209,223,'Place & Signal Inputs','Maps, feeds and reports'],
    [449,223,'Event Review','Evidence and context'],
    [689,223,'Risk Indicators','Illustrative demo values'],
    [929,223,'Human Decision','Operator approval'],
    [1168,224,'Alerts & Guidance','Approved actions'],
  ];
  for(const [i,v] of low.entries()){const [x,w,a,b]=v;box(s,x,500,w,87,i%2?'#34436C':C.navy);txt(s,a,x+5,504,w-10,30,16,C.white,true,'center');txt(s,b,x+5,538,w-10,33,14,C.white,false,'center');}
  box(s,280,665,1020,55);txt(s,'The dashboard connects each signal to a named location before an operator decides what to do.',286,671,1000,43,17,C.gray,false,'center');
}

// 10. The original prototype mockup footprint now contains a real project screenshot.
{
  const s=await makeSlide(10);box(s,364,145,825,522);
  await shot(s,'3d-nashik-full.png',373,157,810,497,'Nashik 3D place guide screenshot');
  box(s,183,671,1224,120,C.pale);
  txt(s,'KumbhRakshak 3D Place Guide',194,684,1177,32,20,C.red,true);
  txt(s,'Schematic Nashik scene: choose Ramkund or another visible landmark, then open its linked feature portal.',194,725,1177,55,18,C.text);
  note(s,'Real screenshot from the local project demo on 3 October 2026. The 3D scene is illustrative, not an official site plan.');
}

// 11. Implementation: the source's icon-and-panel composition is retained.
{
  const s=await makeSlide(11);
  box(s,170,195,510,36);txt(s,'Prototype Modules',170,198,490,30,24,C.red,true,'left','Cambria');
  box(s,255,244,257,201);box(s,596,244,258,201);
  const labels=[
    [259,254,248,70,'3D Place Guide','Illustrative Nashik and Trimbakeshwar scenes'],
    [599,254,239,70,'Crowd Portal','Example 15, 30 and 60-minute forecasts'],
    [259,368,248,70,'Incident Portal','Timeline and operator review'],
    [599,368,239,70,'Claim Review','Evidence before public response'],
  ];
  for(const [x,y,w,h,a,b] of labels){box(s,x,y,w,h);txt(s,a,x,y,w,29,19,C.text,true);txt(s,b,x,y+33,w,h-33,16,C.text);}
  box(s,864,257,544,124,C.navy);txt(s,'Prototype Status',883,274,500,30,21,C.gold,true);
  txt(s,'Next.js front end  +  FastAPI back end\nIn-memory demo data and WebSocket events',882,308,500,58,19,C.white);
  box(s,865,427,575,336,C.white);
  txt(s,'Current boundaries',870,432,520,35,23,C.red,true,'left','Cambria');
  for(const [i,v] of [
    'Real CCTV, crowd counts and GIS are not connected.',
    'Scenario events and forecast values are simulated.',
    'Emergency actions need an authorized human operator.',
  ].entries()) txt(s,'• '+v,888,480+i*70,503,60,18,C.text);
  box(s,182,482,673,175,C.pale);txt(s,'Demo workflow',190,493,630,28,18,C.red,true);
  txt(s,'Select a place, open its portal, review the signal and record an operator decision.',204,537,620,88,20,C.text);
}

// 12. Results: same checks on the left, screenshot in the chart footprint.
{
  const s=await makeSlide(12);
  box(s,170,182,590,37);txt(s,'Demonstrated Prototype Results',177,188,550,30,23,C.red,true,'left','Cambria');
  const rows=[
    '3D place guide opens Nashik and Trimbakeshwar scenes',
    'Ramkund hotspot links to a crowd-related portal',
    'Simulation starts, pauses and logs injected demo events',
    'Crowd portal displays example forecast cards',
    'Overview groups available features by workflow',
    'Local back-end tests passed in demo mode',
    'All operational figures are labeled as illustrative',
    'Field accuracy and response impact remain untested',
  ];
  rows.forEach((v,i)=>{const y=222+i*45;box(s,222,y,522,39);txt(s,v,226,y+1,512,35,16,C.text);});
  box(s,761,142,651,468);await shot(s,'crowd-forecast.png',769,178,637,395,'Crowd forecast portal screenshot');
  txt(s,'Crowd portal: simulated values',784,573,595,28,17,C.gray,false,'center');
  box(s,170,623,566,153);txt(s,'Validation before field use',174,628,530,31,22,C.red,true,'left','Cambria');
  txt(s,'Connect verified GIS and live feeds, then test alerts, accuracy and response workflows with local authorities.',178,675,533,79,18,C.text);
  box(s,768,614,633,123,C.pale);txt(s,'The screenshots demonstrate software behavior; they do not establish safety performance at a real event.',788,637,585,77,18,C.red);
  note(s,'Screenshot from local project demo, 3 October 2026. Forecast values are simulated, not measured field data.');
}

// 13. Future Scope: preserve seven icon positions and two-column spacing.
{
  const s=await makeSlide(13);
  const vals=[
    [242,207,560,75,'Use approved 2027 GIS and ghat facility coordinates'],
    [242,351,560,75,'Integrate permissioned camera and incident feeds'],
    [242,490,560,75,'Measure risk-model accuracy and false alerts locally'],
    [242,650,560,75,'Connect emergency services through approved protocols'],
    [898,207,515,75,'Add audited, multilingual public guidance'],
    [898,351,515,75,'Test low-connectivity use with volunteers'],
    [898,490,515,75,'Run staged pilots before operational use'],
    [898,625,515,100,'Study historical data for future planning'],
  ];
  for(const [x,y,w,h,v] of vals){box(s,x,y,w,h);txt(s,v,x+1,y+4,w-2,h-7,19,C.text);}
}

// 14. References: retain the numbered citation format and typography.
{
  const s=await makeSlide(14);box(s,173,193,1261,605);
  const refs=[
    'Kanaujiya, A.K. & Tiwari, V. (2022), Crowd Management and Strategies for Security and Surveillance During Large Mass Gathering Events: Prayagraj Kumbh Mela 2019 Experience. National Academy Science Letters.',
    'Nashik District Administration, Ramkund Nashik, official landmark information.',
    'Nashik District Administration, Kushavart Tirtha, Trimbakeshwar, official landmark information.',
    'Tiwari, S. & Chowdhary, R. (2022), Technology and crowd management: Kumbh case study.',
    'KumbhRakshak project repository: github.com/hardiksedani/mahakumbh_projects',
    'KumbhRakshak local website prototype, screenshots captured 3 October 2026.',
  ];
  refs.forEach((v,i)=>{const y=206+i*86;txt(s,`[${i+1}]`,179,y+12,45,35,19,C.red,true);txt(s,v,227,y,1180,70,17,C.text);});
  note(s,'Project repository: https://github.com/hardiksedani/mahakumbh_projects\nOfficial landmark sources: https://nashik.gov.in/en/tourist-place/ramkund-nashik/ and https://nashik.gov.in/en/tourist-place/kushavart-tirtha-trimbakeshwar/');
}

// 15. Additional screenshots use the same original mockup-and-callout slide format.
{
  const s=await makeSlide(10);box(s,365,145,825,522);
  await shot(s,'3d-nashik-full.png',180,197,595,390,'Nashik 3D guide');
  await shot(s,'3d-trimbakeshwar.png',785,197,595,390,'Trimbakeshwar 3D guide');
  box(s,183,671,1224,120,C.pale);
  txt(s,'Two Linked 3D Scenes',194,684,1177,32,20,C.red,true);
  txt(s,'Nashik and Trimbakeshwar each have schematic landmarks and direct links to the relevant feature portals.',194,725,1177,55,18,C.text);
  note(s,'Two screenshots from the local project demo. Scenes and pin locations are illustrative and require official GIS approval.');
}

// 16. Keep the source Thank You slide pixel-for-pixel as provided.
{const s=await makeSlide(16);note(s,'Thank you.');}

const draftPath=path.join(draftDir,'KumbhRakshak_SAARTHI_candidate.pptx');
await (await PresentationFile.exportPptx(deck)).save(draftPath);
for(let i=0;i<deck.slides.items.length;i++){
  const png=await deck.slides.getItem(i).export({format:'png',scale:1});
  await fs.writeFile(path.join(draftDir,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
}
const sourceHash=crypto.createHash('sha256').update(await fs.readFile(sourcePdf)).digest('hex');
const result=await finalizePresentation({
  workspaceDir,candidatePath:draftPath,finalPath:outputPath,pythonExecutable:runtimePython,
  integrityValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs:['--expected-slide-size-emu','13716000,7715250','--validate-bullet-geometry','--validate-heading-fit'],
  explicitTotalSlideCount:16,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],
  fontPolicy:{basis:'reference',families:['Calibri','Cambria'],referencePath:sourcePdf,referenceSha256:sourceHash},
  verifyArtifactToolImport:true,receiptPath:path.join(draftDir,'validation-final.json'),
});
console.log(JSON.stringify({outputPath,slideCount:deck.slides.items.length,result},null,2));
