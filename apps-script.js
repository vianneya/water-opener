/** ---- Utilities ---- */
function cors(output) {
  return output
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}
function ok(data){ return cors(ContentService.createTextOutput(JSON.stringify({ ok:true, data }))); }
function fail(msg){ return cors(ContentService.createTextOutput(JSON.stringify({ ok:false, error: String(msg) }))); }
function doOptions() { return cors(ContentService.createTextOutput('')); }

function getSheet_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log');
  if (!sh) throw new Error('Sheet "Log" not found');
  return sh;
}
function readRows_() {
  const sh = getSheet_();
  const values = sh.getDataRange().getValues(); // includes header
  if (values.length < 2) return [];
  return values.slice(1).map(r => ({
    timestamp: r[0] ? new Date(r[0]) : null,
    upc: String(r[1] || ''),
    bottle_id: String(r[2] || ''),
    person: String(r[3] || ''),
    note: String(r[4] || ''),
    device: String(r[5] || '')
  }));
}

/** Next index for a given UPC (max suffix + 1) */
function nextIndexForUPC_(upc, rows) {
  const prefix = upc + '-';
  let maxN = 0;
  for (const row of rows) {
    if (row.bottle_id && row.bottle_id.startsWith(prefix)) {
      const part = row.bottle_id.substring(prefix.length);
      const n = parseInt(part, 10);
      if (!isNaN(n) && n > maxN) maxN = n;
    }
  }
  return maxN + 1;
}

/** ---- POST: create a log row ----
 * Body JSON: { upc, person, note?, device?, bottle_id? }
 * If bottle_id omitted, compute `${upc}-${nextIndex}`.
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const upc = String(body.upc || '').trim();
    if (!upc) throw new Error('Missing upc');

    let bottle_id = String(body.bottle_id || '').trim();
    const person = String(body.person || '').trim();
    const note = String(body.note || '');
    const device = String(body.device || '');

    const rows = readRows_();
    if (!bottle_id) {
      const nextN = nextIndexForUPC_(upc, rows);
      bottle_id = `${upc}-${nextN}`;
    }

    const sh = getSheet_();
    sh.appendRow([ new Date(), upc, bottle_id, person, note, device ]);

    return ok({ saved: true, upc, bottle_id });
  } catch (err) {
    return fail(err.message);
  }
}

/** ---- GET: read endpoints ----
 * ?action=health            -> "OK"
 * ?action=last              -> last row (object)
 * ?action=lastPerPerson     -> map { person -> last row }
 * ?action=today             -> array of rows for today
 * ?action=nextIndex&upc=XXX -> number
 */
function doGet(e) {
  try {
    const action = (e.parameter.action || 'health').toLowerCase();
    if (action === 'health') return ok('OK');

    const rows = readRows_().map(r => ({
      timestamp: r.timestamp ? r.timestamp.toISOString() : null,
      upc: r.upc,
      bottle_id: r.bottle_id,
      person: r.person,
      note: r.note,
      device: r.device
    }));

    if (action === 'last') {
      return ok(rows[rows.length - 1] || null);
    }

    if (action === 'lastperperson') {
      const latest = {};
      for (const r of rows) {
        const p = r.person || 'Unknown';
        if (!latest[p] || new Date(r.timestamp) > new Date(latest[p].timestamp)) {
          latest[p] = r;
        }
      }
      return ok(latest);
    }

    if (action === 'today') {
      const tz = Session.getScriptTimeZone() || 'America/New_York';
      const todayStr = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
      const filtered = rows.filter(r =>
        Utilities.formatDate(new Date(r.timestamp), tz, 'yyyy-MM-dd') === todayStr
      );
      return ok(filtered);
    }

    if (action === 'nextindex') {
      const upc = String(e.parameter.upc || '').trim();
      if (!upc) return fail('Missing upc');
      const rawRows = readRows_();
      return ok(nextIndexForUPC_(upc, rawRows));
    }

    return fail('Unknown action');
  } catch (err) {
    return fail(err.message);
  }
} 