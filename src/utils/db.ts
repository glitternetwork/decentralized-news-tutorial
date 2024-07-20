import {
  Coins,
  Numeric,
  LCDClient,
  MnemonicKey,
} from "@glitterprotocol/glitter-sdk";

const libraryTable = "trna.cluster";
const newsTable = "trna.news_v3";
const libraryColumns = "_id,size,title,content,image";
const newsColumns = "_id,title,content,image,cluster_id,source,news_time";
const length = 50;
const highlight = "";

const XIAN_HOST = "https://gateway.magnode.ru";
const CHAIN_ID = "xian";
const mnemonicKey = 'lesson police usual earth embrace someone opera season urban produce jealous canyon shrug usage subject cigar imitate hollow route inhale vocal special sun fuel';

const client = new LCDClient({
  URL: XIAN_HOST,
  chainID: CHAIN_ID,
  gasPrices: Coins.fromString("0.15agli"),
  gasAdjustment: Numeric.parse(1.5),
});

const key = new MnemonicKey({
  mnemonic: mnemonicKey,
});

export const dbClient = client.db(key);

function assembleOrder(order: string) {
  return `order by ${order} desc`;
}

export function processDataModal(resultArr: { row: any }[]): any[] {
  return resultArr.map((item) => {
    const obj: Record<any, any> = {};
    Object.keys(item.row).forEach((key) => {
      obj[key] = item.row[key].value;
    });
    return obj;
  });
}

export function assembleSql(time1: string, time2: string) {
  return `select ${highlight} ${libraryColumns} from ${libraryTable} where to_time>=${time1} and from_time<=${time2} ${assembleOrder(
    "size"
  )}  limit ${length} `;
}

export function assembleClusterByID(id: string) {
  return `select ${highlight} ${libraryColumns} from ${libraryTable} where _id='${id}' ${assembleOrder(
    "size"
  )}  limit ${length} `;
}

export function assembleDetailSql(id: string) {
  return `select ${newsColumns} from ${newsTable} where cluster_id='${id}' order by news_time desc`;
}

export function assembleIDsSql(ids: string[]) {
  const sqlConditions = ids.map((id) => `cluster_id = '${id}'`).join(" OR ");
  return `select ${newsColumns} from ${newsTable} where ${sqlConditions} order by news_time desc`;
}

export function searchSource() {
  return `select _id,name from trna.source limit 2000`;
}
