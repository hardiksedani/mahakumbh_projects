import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const modulePath = 'C:/Users/hardi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const { FileBlob, PresentationFile } = await import(pathToFileURL(modulePath).href);
const source = 'C:/Users/hardi/OneDrive/Desktop/Role_of_Social_Media_in_Mahakumbh_PBL_Presentation.pptx';
const deck = await PresentationFile.importPptx(await FileBlob.load(source));
const report = await deck.inspect({ kind: 'slide,textbox,shape,image,layout', maxChars: 50000 });
await fs.writeFile('.codex-ppt-work/reference/pptx-inspect.ndjson', report.ndjson);
const montage = await deck.export({ format: 'png', montage: true, scale: 0.5 });
await fs.writeFile('.codex-ppt-work/reference/pptx-montage.png', new Uint8Array(await montage.arrayBuffer()));
console.log('slides', deck.slides.items.length, 'masters', deck.masters.items.length, 'layouts', deck.layouts.items.length);
