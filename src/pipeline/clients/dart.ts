/**
 * DART OpenAPI 클라이언트
 * https://opendart.fss.or.kr
 */

const BASE_URL = "https://opendart.fss.or.kr/api";

function getApiKey(): string {
  const key = process.env.DART_API_KEY;
  if (!key) throw new Error("Missing DART_API_KEY");
  return key;
}

async function fetchDart<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("crtfc_key", getApiKey());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`DART API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ──

export interface DartCorpCode {
  corp_code: string;
  corp_name: string;
  stock_code: string;
  modify_date: string;
}

export interface DartCompany {
  status: string;
  corp_code: string;
  corp_name: string;
  corp_name_eng: string;
  stock_name: string;
  stock_code: string;
  ceo_nm: string;
  corp_cls: string; // Y=KOSPI, K=KOSDAQ
  induty_code: string;
  est_dt: string;
  acc_mt: string;
}

export interface DartFinancialItem {
  rcept_no: string;
  bsns_year: string;
  corp_code: string;
  sj_nm: string; // 재무상태표, 손익계산서 등
  account_nm: string;
  thstrm_amount: string; // 당기
  frmtrm_amount: string; // 전기
  bfefrmtrm_amount: string; // 전전기
  fs_div: string; // CFS=연결, OFS=별도
}

export interface DartDividendItem {
  se: string; // 항목명
  stock_knd: string; // 보통주/우선주
  thstrm: string;
  frmtrm: string;
  lwfr: string;
}

interface DartListResponse<T> {
  status: string;
  message: string;
  list?: T[];
}

// ── API 호출 ──

/** 기업코드 목록 다운로드 (ZIP → XML) */
export async function fetchCorpCodes(): Promise<DartCorpCode[]> {
  const url = `${BASE_URL}/corpCode.xml?crtfc_key=${getApiKey()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`DART corpCode download failed: ${res.status}`);

  const buffer = await res.arrayBuffer();

  // ZIP 해제 → XML 파싱은 Node.js에서 처리
  const { Readable } = await import("node:stream");
  const { createWriteStream } = await import("node:fs");
  const { mkdtemp, readFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { execSync } = await import("node:child_process");

  const tmpDir = await mkdtemp(join(tmpdir(), "dart-"));
  const zipPath = join(tmpDir, "corp.zip");

  // ZIP 파일 저장
  const writeStream = createWriteStream(zipPath);
  const readable = new Readable();
  readable.push(Buffer.from(buffer));
  readable.push(null);
  await new Promise<void>((resolve, reject) => {
    readable.pipe(writeStream);
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  // 압축 해제
  execSync(`unzip -o "${zipPath}" -d "${tmpDir}"`, { stdio: "pipe" });

  // XML 파싱
  const xmlContent = await readFile(join(tmpDir, "CORPCODE.xml"), "utf-8");
  const corps: DartCorpCode[] = [];
  const regex =
    /<list>[\s\S]*?<corp_code>([^<]*)<\/corp_code>[\s\S]*?<corp_name>([^<]*)<\/corp_name>[\s\S]*?<stock_code>([^<]*)<\/stock_code>[\s\S]*?<modify_date>([^<]*)<\/modify_date>[\s\S]*?<\/list>/g;

  let match;
  while ((match = regex.exec(xmlContent)) !== null) {
    corps.push({
      corp_code: match[1].trim(),
      corp_name: match[2].trim(),
      stock_code: match[3].trim(),
      modify_date: match[4].trim(),
    });
  }

  return corps;
}

/** 기업 상세정보 */
export async function fetchCompany(corpCode: string): Promise<DartCompany> {
  return fetchDart<DartCompany>("company.json", { corp_code: corpCode });
}

/** 주요 재무제표 (간략) */
export async function fetchFinancials(
  corpCode: string,
  year: number,
  reprtCode: string = "11011" // 사업보고서(연간)
): Promise<DartFinancialItem[]> {
  const res = await fetchDart<DartListResponse<DartFinancialItem>>(
    "fnlttSinglAcnt.json",
    {
      corp_code: corpCode,
      bsns_year: String(year),
      reprt_code: reprtCode,
      fs_div: "CFS", // 연결 우선
    }
  );
  if (res.status !== "000" || !res.list) return [];
  return res.list;
}

/** 배당 관련 사항 */
export async function fetchDividend(
  corpCode: string,
  year: number,
  reprtCode: string = "11011"
): Promise<DartDividendItem[]> {
  const res = await fetchDart<DartListResponse<DartDividendItem>>(
    "alotMatter.json",
    {
      corp_code: corpCode,
      bsns_year: String(year),
      reprt_code: reprtCode,
    }
  );
  if (res.status !== "000" || !res.list) return [];
  return res.list;
}
