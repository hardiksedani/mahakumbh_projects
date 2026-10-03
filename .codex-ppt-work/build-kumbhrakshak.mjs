import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const workspaceDir = 'C:/Users/hardi/Coding All Programs/mahakumbh';
const skillDir = 'C:/Users/hardi/.codex/plugins/cache/openai-primary-runtime/presentations/26.904.11930/skills/presentations';
const runtimePython = 'C:/Users/hardi/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
process.env.RUNTIME_NODE_MODULES = 'C:/Users/hardi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const modulePath = 'C:/Users/hardi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const sourcePath = 'C:/Users/hardi/OneDrive/Desktop/Role_of_Social_Media_in_Mahakumbh_PBL_Presentation.pptx';
const workDir = path.join(workspaceDir, '.codex-ppt-work');
const outputPath = path.join(workspaceDir, 'output', 'pptx', 'KumbhRakshak_PBL_Presentation_2026-10-03.pptx');
const { FileBlob, PresentationFile } = await import(pathToFileURL(modulePath).href);
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, 'container_tools/artifact_tool_utils.mjs')).href);

const deck = await PresentationFile.importPptx(await FileBlob.load(sourcePath));
const inspectRows = (await fs.readFile(path.join(workDir, 'reference', 'pptx-inspect.ndjson'), 'utf8'))
  .split(/\r?\n/).filter(Boolean).map(JSON.parse);
const originalById = new Map(inspectRows.filter(r => r.kind === 'textbox').map(r => [r.id, r.text]));

function replaceAll(id, oldText, newText) {
  const shape = deck.resolve(id);
  shape.text.replace(oldText, newText);
  if (!String(shape.text).includes(newText)) throw new Error(`Text replacement failed: ${id}`);
}

function replaceLines(id, replacementLines) {
  const oldLines = originalById.get(id).split(/\r?\n/).filter(line => line.trim());
  if (oldLines.length !== replacementLines.length) {
    throw new Error(`Line count mismatch in ${id}: ${oldLines.length} vs ${replacementLines.length}`);
  }
  const shape = deck.resolve(id);
  oldLines.map((oldLine, i) => ({ oldLine, i })).reverse().forEach(({ oldLine, i }) => {
    shape.text.replace(oldLine, replacementLines[i]);
    if (!String(shape.text).includes(replacementLines[i])) throw new Error(`Could not replace line ${i+1} in ${id}`);
  });
}

replaceAll('sh/jadg7ql0', 'Role of Social Media in Organising and Managing in kumbh Mela',
  'KumbhRakshak: Safety and Decision Support for Nashik-Trimbakeshwar');
replaceAll('sh/2lgfahgb', 'Gantt Chart', 'Prototype Screenshots');
replaceAll('sh/2lgfahgb', 'Summary/ Findings of Literature Survey', 'Findings and Research Gap');
replaceAll('sh/sjix0zy1', 'Software /Hardware requirement', 'Software / Hardware Requirements');
replaceAll('sh/ofq5svm5', 'System design', 'System Design');
replaceAll('sh/kzu5c32t', 'System implementation ', 'System Implementation');

replaceLines('sh/yd0ny1wb', [
  'KumbhRakshak: Nashik-Trimbakeshwar Safety Prototype',
  'The 2027 Simhastha will need clear place context and timely information across ghats, routes and facilities.',
  'KumbhRakshak brings monitoring signals and response tools into one command-centre website.',
  'What the Platform Shows',
  'An illustrative 3D guide links Nashik and Trimbakeshwar landmarks to the relevant crowd, map, camera, shelter and incident portals.',
  'The present build is a demonstration with simulated operational data. It is not an official navigation or emergency-response system.',
]);
replaceLines('sh/25gjihgf', [
  'The Core Problem',
  'Crowd, camera, social and field signals arrive through separate channels during a large gathering.',
  'Without place context, users may struggle to identify which facility or portal is relevant to a situation.',
  'Unverified claims can add confusion, while response decisions still require evidence and human review.',
  'Problem Statement',
  'How can one understandable interface connect locations, signals and response workflows for the Nashik-Trimbakeshwar Kumbh?',
]);
replaceLines('sh/zelw7ul4', [
  'Primary Objective',
  'Build a clear decision-support prototype for operators and project reviewers, centered on Nashik and Trimbakeshwar.',
  'Specific Objectives',
  'Explain key landmarks and portals through an interactive 3D place guide.',
  'Show crowd pressure, camera observations and incident information together.',
  'Review social claims with available evidence before any public response.',
  'Support shelter, resource and advisory workflows in one website.',
  'Distinguish simulated data and schematic locations from verified field information.',
]);
replaceLines('sh/6pcbeds7', [
  'What the Literature Confirms',
  'Kumbh studies describe the difficulty of managing large pedestrian flows and coordinating safety teams.',
  'Crowd research shows the value of zone-level observation and forecasting for early review.',
  'Social-media studies also show that fast-moving rumours can complicate a real incident response.',
  'The Gap We Address',
  'KumbhRakshak demonstrates a place-linked interface that brings monitoring, claim review and response tools together. Field validation remains necessary.',
]);
replaceLines('sh/bmxk3mtw', [
  'Software Requirements',
  'Frontend: Next.js, React, Tailwind CSS and Three.js',
  'Backend: Python 3.12, FastAPI and WebSockets',
  'Data: Firestore adapter with in-memory demo mode',
  'Mapping: Mapbox GL and OpenStreetMap landmark links',
  'AI modules: vision, text clustering, risk and forecasting',
  'Simulation: timeline and example incident injections',
  'Packaging: Docker and Docker Compose',
  'Tools: Git, GitHub and VS Code',
]);
replaceLines('sh/oj6187u5', [
  'Hardware Requirements',
  'Demo machine: modern CPU, 8-16 GB RAM and SSD',
  'GPU optional for local camera-model inference',
  'Permissioned CCTV or video feeds needed for a real pilot',
  'Reliable network and secure server for deployment',
  'Official GIS and facility data required before field use',
]);
for (const [id, newLines] of [
  ['sh/lcvahcfm', ['Place &', 'Camera Signals']],
  ['sh/zatsf2xg', ['Social &', 'Field Reports']],
  ['sh/90valwfi', ['Event & Claim', 'Review']],
  ['sh/p4rq9sfe', ['Human', 'Decision']],
  ['sh/6x8v6l0b', ['Portal &', 'Advisory']],
]) {
  replaceLines(id, newLines);
}
replaceLines('sh/t0zuh0zm', [
  'Data Flow',
  'Place, camera and public-report inputs are organized into location-linked views.',
  'The system groups observations and presents claims with supporting or missing evidence.',
  'Risk indicators support review; a human operator remains responsible for any action.',
  'Approved information can then be displayed in the dashboard and advisory workflow.',
]);
replaceLines('sh/kzuxkzqh', [
  'Implemented Prototype Modules',
  '3D place guide: schematic Nashik and Trimbakeshwar scenes with portal links.',
  'Overview dashboard: feature guide, situation indicators and incident review.',
  'Simulation: a 16-step timeline and manual demo-event injections.',
  'Crowd portal: example 15, 30 and 60-minute forecasts and holding-area views.',
  'Other portals: camera, incident, shelter, resource and public-report workflows.',
  'Claim scanner: a demo interface for evidence review; real feeds require integration.',
  'Tech Stack in Practice',
  'Next.js frontend, FastAPI backend, WebSockets and an in-memory demo database.',
]);
replaceLines('sh/dg3m58ri', [
  'Demonstrated Outcomes (Prototype)',
  'The local simulation starts, pauses and accepts a test fire event with telemetry logging.',
  'The 3D Nashik guide links Ramkund to its crowd portal; Trimbakeshwar has a separate scene.',
  'The crowd page shows example 15, 30 and 60-minute forecast cards.',
  'The overview explains how to explore, monitor and respond across the available portals.',
  'Six core backend tests passed in the local demo environment.',
  'Scope of Current Results',
  'These are software-demo results. Locations, event values and forecasts are illustrative, with no field-performance claim.',
]);
replaceLines('sh/atkzep4b', [
  'Prioritised Roadmap',
  'Replace schematic pins with approved 2027 GIS, ghat and facility coordinates.',
  'Integrate permissioned CCTV, incident feeds and validated crowd counts.',
  'Measure false alerts, model accuracy and response latency with local operators.',
  'Add audit logs, access control and human approval for public advisories.',
  'Test multilingual and low-connectivity guidance with pilgrims and volunteers.',
  'Run a staged pilot before any operational or emergency use.',
]);
replaceLines('sh/i5cvytwr', [
  '[1] Nashik District Administration. Ramkund Nashik: official landmark information.',
  '[2] Nashik District Administration. Kushavart Tirtha, Trimbakeshwar: official landmark information.',
  '[3] Kanaujiya, A.K. & Tiwari, V. (2022). Crowd management and security at Prayagraj Kumbh Mela 2019. National Academy Science Letters.',
  '[4] Tiwari, S. & Chowdhary, R. (2022). Technology and crowd management: Kumbh case study.',
  '[5] JMIR Infodemiology (2025). Narrative review of disaster misinformation on social media.',
  '[6] KumbhRakshak project code and local demo, accessed 3 October 2026.',
]);

const resultsSlide = deck.slides.getItem(10);
function screenshotSlide(title, items, note) {
  const copy = resultsSlide.duplicate();
  const titleShape = copy.shapes.items.find(s => String(s.text).trim().startsWith('Results'));
  const bodyShape = copy.shapes.items.find(s => String(s.text).includes('Demonstrated Outcomes'));
  if (!titleShape || !bodyShape) throw new Error('Could not locate duplicated template text');
  titleShape.text.replace('Results', title);
  bodyShape.text = '';
  for (const item of items) {
    copy.images.add({
      blob: new Uint8Array(item.bytes), contentType: 'image/png',
      alt: item.alt, fit: 'contain', position: item.position,
    });
    const caption = copy.shapes.add({
      geometry: 'textbox', name: `caption-${item.alt}`,
      position: { left: item.position.left, top: item.position.top + item.position.height + 8,
        width: item.position.width, height: 42 },
      fill: 'none', line: { fill: 'none', width: 0 },
    });
    caption.text = item.caption;
    caption.text.style = { typeface: 'Times New Roman', fontSize: 18, color: '#404040', alignment: 'center', autoFit: 'shrinkText' };
  }
  copy.speakerNotes.textFrame.setText(note);
  return copy;
}

const shotDir = path.join(workDir, 'screenshots');
const nashik = await fs.readFile(path.join(shotDir, '3d-nashik-full.png'));
const trimbak = await fs.readFile(path.join(shotDir, '3d-trimbakeshwar.png'));
const overview = await fs.readFile(path.join(shotDir, 'overview.png'));
const crowd = await fs.readFile(path.join(shotDir, 'crowd-forecast.png'));
const slide3d = screenshotSlide('3D Place Guide', [
  { bytes:nashik, alt:'Nashik Ramkund illustrative 3D scene', caption:'Nashik riverfront: Ramkund and portal links', position:{left:145,top:235,width:510,height:350} },
  { bytes:trimbak, alt:'Trimbakeshwar illustrative 3D scene', caption:'Trimbakeshwar: separate landmark scene', position:{left:680,top:235,width:510,height:350} },
], 'Screenshots captured from the local KumbhRakshak demo on 3 October 2026. Both 3D scenes are schematic and must not be used as an official site plan or emergency route.');
slide3d.moveTo(10);
const slideScreens = screenshotSlide('Prototype Website Screens', [
  { bytes:overview, alt:'KumbhRakshak overview dashboard', caption:'Overview and feature guide', position:{left:145,top:245,width:510,height:320} },
  { bytes:crowd, alt:'KumbhRakshak crowd forecast portal', caption:'Crowd portal: illustrative forecast values', position:{left:680,top:245,width:510,height:320} },
], 'Screenshots captured from the local KumbhRakshak demo on 3 October 2026. Dashboard indicators and forecast values shown are simulated, not measured field data.');
slideScreens.moveTo(11);

deck.slides.getItem(14).speakerNotes.textFrame.setText([
  'Reference links for slide 15:',
  'https://nashik.gov.in/en/tourist-place/ramkund-nashik/',
  'https://nashik.gov.in/en/tourist-place/kushavart-tirtha-trimbakeshwar/',
  'https://link.springer.com/article/10.1007/s40009-022-01114-w',
  'https://github.com/hardiksedani/mahakumbh_projects',
].join('\n'));

await fs.mkdir(path.join(workDir, 'draft'), { recursive: true });
await fs.mkdir(path.dirname(outputPath), { recursive: true });
const draftPath = path.join(workDir, 'draft', 'KumbhRakshak_candidate.pptx');
await (await PresentationFile.exportPptx(deck)).save(draftPath);
for (let i=0; i<deck.slides.items.length; i++) {
  const preview = await deck.slides.getItem(i).export({ format:'png', scale:1 });
  await fs.writeFile(path.join(workDir, 'draft', `slide-${String(i+1).padStart(2,'0')}.png`), new Uint8Array(await preview.arrayBuffer()));
}
const sourceHash = crypto.createHash('sha256').update(await fs.readFile(sourcePath)).digest('hex');
const result = await finalizePresentation({
  workspaceDir,
  candidatePath:draftPath,
  finalPath:outputPath,
  pythonExecutable:runtimePython,
  integrityValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],
  explicitTotalSlideCount:16,
  requiredNativeTableOwnerSlides:[],
  requiredNativeChartOwnerSlides:[],
  fontPolicy:{basis:'reference',families:['Times New Roman'],referencePath:sourcePath,referenceSha256:sourceHash},
  verifyArtifactToolImport:true,
  receiptPath:path.join(workDir,'draft','validation.json'),
});
console.log(JSON.stringify({outputPath,slideCount:deck.slides.items.length,result},null,2));
