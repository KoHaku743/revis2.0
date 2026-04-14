import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

let sheets;
let sheetsAvailable = false;

try {
  const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');
  
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheets = google.sheets({ version: 'v4', auth });
  sheetsAvailable = true;
} catch (err) {
  console.warn('Google Sheets API not configured:', err.message);
}

export async function ensureMonthlyTab(date) {
  if (!sheetsAvailable) {
    console.warn('Google Sheets not available');
    return false;
  }

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const tabName = `${month}${year}`;

  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const tabExists = response.data.sheets.some(
      (sheet) => sheet.properties.title === tabName
    );

    if (!tabExists) {
      const vzorTab = response.data.sheets.find(
        (sheet) => sheet.properties.title === 'VZOR'
      );

      if (vzorTab) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                duplicateSheet: {
                  sourceSheetId: vzorTab.properties.sheetId,
                  newSheetName: tabName,
                },
              },
            ],
          },
        });
      }
    }

    return true;
  } catch (err) {
    console.error('Error ensuring monthly tab:', err);
    return false;
  }
}

export async function appendRepairToSheet(repairEntry, phone, user) {
  if (!sheetsAvailable) {
    console.warn('Google Sheets not available');
    return false;
  }

  try {
    const date = new Date(repairEntry.repair_date);
    await ensureMonthlyTab(date);

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const tabName = `${month}${year}`;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const nh =
      {
        1: 5,
        2: 10,
        3: 15,
        4: 15,
      }[repairEntry.button_action] || 0;

    const row = [
      new Date(repairEntry.repair_date).toLocaleDateString('sk-SK'),
      phone.serial_number,
      phone.model,
      repairEntry.parts_used || '',
      repairEntry.description || '',
      '',
      repairEntry.button_action === 1,
      repairEntry.button_action === 2,
      repairEntry.button_action === 3,
      repairEntry.button_action === 4,
      '',
      repairEntry.service_price || '',
      nh,
      '',
      repairEntry.test_ok || false,
      repairEntry.test_nok || false,
      '',
      repairEntry.service_type || '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${tabName}'!A2`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    return true;
  } catch (err) {
    console.error('Error appending to sheet:', err);
    return false;
  }
}
