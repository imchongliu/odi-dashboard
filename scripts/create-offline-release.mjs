import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const releaseRoot = resolve(projectRoot, "..", "China-ODI-Dashboard-Offline");
const sourceDataPath = resolve(projectRoot, "upload", "pasted_file_YqX3So_investments.json");
const mapPath = resolve(projectRoot, "client", "public", "world-map.jpg");

if (!existsSync(sourceDataPath)) {
  throw new Error(`Missing source data: ${sourceDataPath}`);
}

if (!existsSync(mapPath)) {
  throw new Error(`Missing world map asset: ${mapPath}`);
}

const investments = JSON.parse(readFileSync(sourceDataPath, "utf8"));
const mapDataUrl = `data:image/jpeg;base64,${readFileSync(mapPath).toString("base64")}`;
const embeddedData = JSON.stringify(investments).replaceAll("</", "<\\/");

rmSync(releaseRoot, { recursive: true, force: true });
mkdirSync(resolve(releaseRoot, "data"), { recursive: true });
writeFileSync(resolve(releaseRoot, "data", "investments.json"), JSON.stringify(investments, null, 2));
cpSync(resolve(projectRoot, "LICENSE"), resolve(releaseRoot, "LICENSE"));

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="China ODI Dashboard offline edition" />
  <title>China ODI Dashboard — Offline Edition</title>
  <style>
    :root { --ink:#14233b; --muted:#65758b; --line:#dbe4ef; --canvas:#f6f9fc; --card:#fff; --blue:#2e7df6; --green:#15b989; --purple:#8757e8; --orange:#eb8a3c; --shadow:0 10px 30px rgba(23,52,87,.08); }
    * { box-sizing:border-box; }
    html { background:var(--canvas); scroll-behavior:smooth; }
    body { margin:0; min-width:320px; background:var(--canvas); color:var(--ink); font:14px/1.45 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; }
    button,input,select { font:inherit; }
    button { cursor:pointer; }
    .app-shell { min-height:100vh; }
    .site-header { position:sticky; top:0; z-index:30; display:flex; align-items:center; justify-content:space-between; gap:18px; min-height:68px; padding:10px max(20px,calc((100vw - 1200px)/2)); background:rgba(255,255,255,.94); border-bottom:1px solid var(--line); backdrop-filter:blur(12px); }
    .brand { display:flex; align-items:center; gap:10px; font-weight:800; line-height:1.05; letter-spacing:-.02em; }
    .brand-mark { display:grid; place-items:center; width:38px; height:38px; border-radius:11px; color:#fff; background:linear-gradient(135deg,#2f89fb,#376ee8); font-size:12px; box-shadow:0 7px 16px rgba(46,125,246,.24); }
    .brand small { display:block; margin-top:3px; color:var(--muted); font-size:10px; font-weight:600; letter-spacing:0; }
    .nav { display:flex; align-items:center; gap:4px; overflow-x:auto; }
    .nav button,.language-toggle { border:0; border-radius:9px; padding:9px 12px; color:var(--muted); background:transparent; font-weight:650; white-space:nowrap; }
    .nav button:hover,.nav button.active { color:var(--blue); background:#edf5ff; }
    .language-toggle { color:var(--ink); border:1px solid var(--line); background:#fff; }
    .main { width:min(1200px,calc(100% - 40px)); margin:0 auto; padding:32px 0 56px; }
    .page { display:none; }
    .page.active { display:block; }
    .eyebrow { display:inline-flex; align-items:center; gap:7px; padding:5px 9px; color:#1669d9; border-radius:999px; background:#eaf4ff; font-size:12px; font-weight:750; }
    h1 { margin:10px 0 5px; font-size:clamp(25px,3vw,35px); letter-spacing:-.04em; line-height:1.16; }
    h2 { margin:0; font-size:18px; letter-spacing:-.02em; }
    h3 { margin:0; font-size:15px; }
    .subhead,.muted { color:var(--muted); }
    .subhead { max-width:720px; margin:0; font-size:15px; }
    .offline-note { display:inline-flex; gap:7px; align-items:center; margin-top:14px; color:#27624f; padding:7px 10px; border-radius:8px; background:#e9fbf5; font-size:12px; font-weight:650; }
    .dot { width:7px; height:7px; border-radius:99px; background:var(--green); }
    .metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin:24px 0; }
    .metric,.panel { background:var(--card); border:1px solid var(--line); border-radius:14px; box-shadow:var(--shadow); }
    .metric { min-height:118px; padding:17px; position:relative; overflow:hidden; }
    .metric:before { content:""; position:absolute; left:0; top:0; bottom:0; width:4px; background:var(--accent,var(--blue)); }
    .metric .icon { position:absolute; right:15px; top:15px; width:34px; height:34px; display:grid; place-items:center; border-radius:10px; color:var(--accent,var(--blue)); background:color-mix(in srgb,var(--accent,var(--blue)) 10%,white); font-size:18px; }
    .metric .label { color:var(--muted); font-size:13px; }
    .metric .value { margin-top:5px; font-size:25px; font-weight:800; letter-spacing:-.04em; }
    .metric .minor { margin-top:2px; color:var(--muted); font-size:13px; }
    .grid-two { display:grid; grid-template-columns:1.25fr .9fr; gap:18px; margin-top:18px; }
    .panel { padding:20px; }
    .panel-title { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; margin-bottom:18px; }
    .panel-title p { margin:3px 0 0; color:var(--muted); font-size:13px; }
    .chart { height:220px; display:flex; align-items:flex-end; gap:9px; padding:14px 2px 26px; border-bottom:1px solid var(--line); position:relative; }
    .bar-group { flex:1; min-width:14px; height:100%; display:flex; align-items:flex-end; justify-content:center; gap:3px; position:relative; }
    .bar { width:min(14px,45%); border-radius:5px 5px 2px 2px; transition:height .2s ease; }
    .bar.ma { background:linear-gradient(#a788ff,var(--purple)); }.bar.gf { background:linear-gradient(#41d4aa,var(--green)); }
    .bar-group label { position:absolute; top:calc(100% + 6px); color:var(--muted); font-size:10px; white-space:nowrap; }
    .legend { display:flex; align-items:center; gap:13px; color:var(--muted); font-size:12px; }.legend i { display:inline-block; width:9px; height:9px; margin-right:4px; border-radius:2px; vertical-align:middle; }
    .ranking { display:grid; gap:11px; }.rank-row { display:grid; grid-template-columns:24px minmax(90px,1fr) 70px; gap:9px; align-items:center; }.rank-no { color:var(--muted); font-size:12px; }.rank-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:650; }.rank-track { height:8px; overflow:hidden; border-radius:100px; background:#edf1f5; }.rank-fill { height:100%; border-radius:inherit; background:linear-gradient(90deg,#52a4ff,var(--blue)); }.rank-value { text-align:right; color:var(--muted); font-size:12px; font-variant-numeric:tabular-nums; }
    .filter-bar { display:grid; grid-template-columns:minmax(180px,1fr) repeat(4,minmax(120px,.38fr)); gap:10px; margin:23px 0 14px; }.filter-bar input,.filter-bar select { height:40px; min-width:0; padding:0 11px; border:1px solid var(--line); border-radius:9px; color:var(--ink); background:#fff; outline:none; }.filter-bar input:focus,.filter-bar select:focus { border-color:#8fc1ff; box-shadow:0 0 0 3px #e8f3ff; }
    .table-panel { padding:0; overflow:hidden; }.table-wrap { overflow:auto; }.data-table { width:100%; min-width:850px; border-collapse:collapse; }.data-table th { padding:12px 16px; text-align:left; color:var(--muted); background:#f9fbfd; border-bottom:1px solid var(--line); font-size:11px; letter-spacing:.04em; text-transform:uppercase; }.data-table td { padding:13px 16px; border-bottom:1px solid #edf1f5; vertical-align:middle; }.data-table tbody tr { cursor:pointer; transition:background .15s ease; }.data-table tbody tr:hover { background:#f6faff; }.data-table td.value { text-align:right; font-weight:720; font-variant-numeric:tabular-nums; }.badge { display:inline-flex; padding:3px 8px; border-radius:999px; font-size:11px; font-weight:750; }.badge.ma { background:#f0ebff; color:#7044cc; }.badge.gf { background:#e6faf2; color:#118260; }.badge.other { background:#fff0e5; color:#ba6525; }.badge.completed { background:#e6faf2; color:#118260; }.badge.planning { background:#fff5db; color:#9b6a12; }.badge.progress { background:#e9f2ff; color:#2e69bb; }.pager { display:flex; justify-content:space-between; align-items:center; padding:13px 16px; color:var(--muted); }.pager button { border:1px solid var(--line); padding:7px 11px; border-radius:7px; background:#fff; color:var(--ink); }.pager button:disabled { opacity:.45; cursor:not-allowed; }
    .map-layout { display:grid; grid-template-columns:1.4fr .75fr; gap:18px; }.map-shell { position:relative; min-height:470px; overflow:hidden; border-radius:12px; border:1px solid var(--line); background:#f8fbfd center/cover no-repeat; }.map-shell:after { content:""; position:absolute; inset:0; pointer-events:none; background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.12)); }.map-marker { position:absolute; z-index:2; transform:translate(-50%,-50%); border:2px solid #fff; border-radius:999px; background:rgba(46,125,246,.82); box-shadow:0 3px 10px rgba(16,73,150,.32); transition:transform .16s ease, background .16s ease; }.map-marker:hover { z-index:4; transform:translate(-50%,-50%) scale(1.22); background:var(--blue); }.map-marker:hover span { display:block; }.map-marker span { display:none; position:absolute; left:50%; bottom:calc(100% + 9px); min-width:142px; transform:translateX(-50%); padding:8px 9px; border-radius:8px; background:#16263e; color:#fff; font-size:11px; line-height:1.4; box-shadow:var(--shadow); }.map-marker span b { display:block; font-size:12px; }.destination-list { max-height:470px; overflow:auto; display:grid; gap:7px; }.destination-item { width:100%; display:flex; justify-content:space-between; align-items:center; gap:8px; padding:11px; border:1px solid transparent; border-radius:9px; color:var(--ink); background:#fff; text-align:left; }.destination-item:hover,.destination-item.active { border-color:#b7d8ff; background:#f4f9ff; }.destination-item small { color:var(--muted); }.detail-empty { display:grid; min-height:220px; place-items:center; text-align:center; color:var(--muted); }.destination-detail { display:none; }.destination-detail.active { display:block; }.mini-deal { padding:11px 0; border-bottom:1px solid #edf1f5; }.mini-deal:last-child { border-bottom:0; }.mini-deal button { display:block; width:100%; padding:0; border:0; color:inherit; background:transparent; text-align:left; }.mini-deal p { margin:3px 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--muted); font-size:12px; }
    .modal { position:fixed; inset:0; z-index:50; display:none; place-items:center; padding:20px; background:rgba(15,28,48,.58); }.modal.open { display:grid; }.modal-card { width:min(760px,100%); max-height:90vh; overflow:auto; border-radius:16px; background:#fff; box-shadow:0 30px 80px rgba(0,0,0,.25); }.modal-head { position:sticky; top:0; display:flex; justify-content:space-between; align-items:flex-start; gap:15px; padding:20px 22px 16px; background:#fff; border-bottom:1px solid var(--line); }.modal-head h2 { font-size:19px; }.close { display:grid; place-items:center; width:32px; height:32px; border:1px solid var(--line); border-radius:8px; color:var(--muted); background:#fff; font-size:20px; }.detail-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px 22px; padding:20px 22px 26px; }.detail-grid div { min-width:0; }.detail-grid dt { margin-bottom:3px; color:var(--muted); font-size:11px; font-weight:750; letter-spacing:.04em; text-transform:uppercase; }.detail-grid dd { margin:0; overflow-wrap:anywhere; font-weight:600; }.detail-grid .wide { grid-column:1/-1; }.insight-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }.callout { padding:15px; border-radius:11px; background:#f7faff; border:1px solid #dbeafb; }.callout p { margin:4px 0 0; color:var(--muted); font-size:12px; }.callout b { font-size:22px; letter-spacing:-.04em; }
    footer { padding:20px; color:var(--muted); text-align:center; font-size:12px; }
    @media (max-width:900px) { .metrics { grid-template-columns:repeat(2,1fr); }.grid-two,.map-layout { grid-template-columns:1fr; }.filter-bar { grid-template-columns:repeat(2,1fr); }.filter-bar input { grid-column:1/-1; }.map-shell { min-height:360px; }.site-header { flex-wrap:wrap; }.nav { order:3; width:100%; }.insight-grid { grid-template-columns:1fr; } }
    @media (max-width:560px) { .main { width:min(100% - 24px,1200px); padding-top:20px; }.site-header { padding:10px 12px; }.metrics { gap:10px; }.metric { min-height:104px; padding:14px; }.metric .value { font-size:21px; }.filter-bar { grid-template-columns:1fr; }.filter-bar input { grid-column:auto; }.detail-grid { grid-template-columns:1fr; }.detail-grid .wide { grid-column:auto; }.map-shell { min-height:265px; }.nav button { padding:7px 9px; font-size:12px; } }
  </style>
</head>
<body>
  <div class="app-shell">
    <header class="site-header">
      <div class="brand"><div class="brand-mark">ODI</div><div>China ODI<small>Dashboard · Offline</small></div></div>
      <nav class="nav" aria-label="Dashboard navigation">
        <button data-page="overview" class="active" data-i18n="navOverview">概览</button>
        <button data-page="deals" data-i18n="navDeals">交易数据库</button>
        <button data-page="destinations" data-i18n="navDestinations">投资目的地</button>
        <button data-page="insights" data-i18n="navInsights">M&A 洞察</button>
      </nav>
      <button id="languageToggle" class="language-toggle" type="button">EN</button>
    </header>
    <main class="main">
      <section class="page active" id="overviewPage">
        <span class="eyebrow"><span class="dot"></span><span data-i18n="offlineBadge">本地离线数据快照</span></span>
        <h1 data-i18n="overviewTitle">中国对外投资仪表板</h1>
        <p class="subhead" data-i18n="overviewSubtitle">内置投资数据，无需数据库、无需网络即可浏览与分析。</p>
        <div class="offline-note"><span class="dot"></span><span data-i18n="offlineNote">离线模式：数据、地图和交互均在本机运行</span></div>
        <div class="metrics" id="overviewMetrics"></div>
        <div class="grid-two">
          <section class="panel"><div class="panel-title"><div><h2 data-i18n="monthlyTrend">月度交易趋势</h2><p data-i18n="monthlyTrendSub">按月份统计的 M&A 与绿地投资交易数量</p></div><div class="legend"><span><i style="background:var(--purple)"></i>M&A</span><span><i style="background:var(--green)"></i>Greenfield</span></div></div><div class="chart" id="monthlyChart"></div></section>
          <section class="panel"><div class="panel-title"><div><h2 data-i18n="topDestinations">主要目的地</h2><p data-i18n="topDestinationsSub">按投资金额排名</p></div></div><div class="ranking" id="destinationRanking"></div></section>
        </div>
        <section class="panel" style="margin-top:18px"><div class="panel-title"><div><h2 data-i18n="largestDeals">最大交易</h2><p data-i18n="largestDealsSub">按披露金额排列的前六笔交易</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th data-i18n="date">日期</th><th data-i18n="investor">投资方</th><th data-i18n="destination">目的地</th><th data-i18n="industry">行业</th><th style="text-align:right" data-i18n="dealValue">交易金额</th></tr></thead><tbody id="largestDealsTable"></tbody></table></div></section>
      </section>

      <section class="page" id="dealsPage">
        <span class="eyebrow"><span class="dot"></span><span data-i18n="offlineBadge">本地离线数据快照</span></span>
        <h1 data-i18n="dealsTitle">交易数据库</h1><p class="subhead" data-i18n="dealsSubtitle">检索内置的中国对外直接投资交易记录。</p>
        <div class="filter-bar"><input id="searchInput" type="search" data-i18n-placeholder="searchPlaceholder" placeholder="搜索投资方、目标公司或目的地…"/><select id="typeFilter"></select><select id="destinationFilter"></select><select id="industryFilter"></select><select id="statusFilter"></select></div>
        <div class="panel table-panel"><div class="table-wrap"><table class="data-table"><thead><tr><th data-i18n="date">日期</th><th data-i18n="type">类型</th><th data-i18n="investor">投资方</th><th data-i18n="target">目标公司</th><th data-i18n="destination">目的地</th><th data-i18n="industry">行业</th><th style="text-align:right" data-i18n="dealValue">交易金额</th><th data-i18n="status">状态</th></tr></thead><tbody id="dealsTable"></tbody></table></div><div class="pager"><span id="dealsCount"></span><div><button id="prevPage" type="button">‹</button> <button id="nextPage" type="button">›</button></div></div></div>
      </section>

      <section class="page" id="destinationsPage">
        <span class="eyebrow"><span class="dot"></span><span data-i18n="offlineBadge">本地离线数据快照</span></span>
        <h1 data-i18n="destinationsTitle">投资目的地</h1><p class="subhead" data-i18n="destinationsSubtitle">通过互动地图和目的地排名探索中国对外投资分布。</p>
        <div class="metrics" id="destinationMetrics"></div>
        <div class="map-layout"><section class="panel"><div class="panel-title"><div><h2 data-i18n="globalDistribution">全球投资分布</h2><p data-i18n="clickMarkers">点击地图标记或目的地列表查看交易。</p></div></div><div id="mapShell" class="map-shell"></div></section><aside class="panel"><div class="panel-title"><div><h2 data-i18n="allDestinations">全部目的地</h2><p data-i18n="rankedByValue">按投资金额排序</p></div></div><div id="destinationList" class="destination-list"></div></aside></div>
        <div class="grid-two"><section id="destinationDetail" class="panel destination-detail"></section><section id="destinationEmpty" class="panel detail-empty"><div><div style="font-size:30px">⌖</div><h3 data-i18n="selectDestination">选择一个目的地</h3><p data-i18n="selectDestinationSub">点击地图标记或右侧列表以查看相关交易。</p></div></section><section class="panel"><div class="panel-title"><div><h2 data-i18n="destinationSnapshot">目的地概览</h2><p data-i18n="destinationSnapshotSub">当前数据快照中的全球覆盖情况</p></div></div><div id="industryRanking" class="ranking"></div></section></div>
      </section>

      <section class="page" id="insightsPage">
        <span class="eyebrow"><span class="dot"></span><span data-i18n="offlineBadge">本地离线数据快照</span></span>
        <h1 data-i18n="insightsTitle">M&A 洞察</h1><p class="subhead" data-i18n="insightsSubtitle">基于内置数据快照，对并购活动进行离线概览。</p>
        <div class="insight-grid" id="insightCards"></div>
        <div class="grid-two"><section class="panel"><div class="panel-title"><div><h2 data-i18n="maTopDestinations">M&A 主要目的地</h2><p data-i18n="maTopDestinationsSub">按披露交易金额排序</p></div></div><div class="ranking" id="maDestinationRanking"></div></section><section class="panel"><div class="panel-title"><div><h2 data-i18n="maTopIndustries">M&A 主要行业</h2><p data-i18n="maTopIndustriesSub">按交易数量排序</p></div></div><div class="ranking" id="maIndustryRanking"></div></section></div>
      </section>
    </main>
    <footer>China ODI Dashboard · <span data-i18n="offlineFooter">静态离线版本 · 数据已内置于本地文件</span></footer>
  </div>
  <div class="modal" id="detailModal" aria-modal="true" role="dialog"><article class="modal-card"><header class="modal-head"><div><span class="eyebrow" style="margin-bottom:7px"><span class="dot"></span><span data-i18n="offlineBadge">本地离线数据快照</span></span><h2 id="modalTitle">—</h2><p class="muted" id="modalSubtitle" style="margin:4px 0 0"></p></div><button id="modalClose" class="close" type="button" aria-label="Close">×</button></header><dl class="detail-grid" id="modalDetails"></dl></article></div>
  <script>
  const RAW_DATA = ${embeddedData};
  const WORLD_MAP = "${mapDataUrl}";
  const locale = { lang:"zh", page:"overview", selectedDestination:null, dealsPage:1, filteredDeals:[] };
  const TEXT = {
    zh: { navOverview:"概览",navDeals:"交易数据库",navDestinations:"投资目的地",navInsights:"M&A 洞察",offlineBadge:"本地离线数据快照",offlineNote:"离线模式：数据、地图和交互均在本机运行",overviewTitle:"中国对外投资仪表板",overviewSubtitle:"内置投资数据，无需数据库、无需网络即可浏览与分析。",monthlyTrend:"月度交易趋势",monthlyTrendSub:"按月份统计的 M&A 与绿地投资交易数量",topDestinations:"主要目的地",topDestinationsSub:"按投资金额排名",largestDeals:"最大交易",largestDealsSub:"按披露金额排列的前六笔交易",date:"日期",type:"类型",investor:"投资方",target:"目标公司",destination:"目的地",industry:"行业",dealValue:"交易金额",status:"状态",dealsTitle:"交易数据库",dealsSubtitle:"检索内置的中国对外直接投资交易记录。",searchPlaceholder:"搜索投资方、目标公司或目的地…",allTypes:"全部类型",allDestinations:"全部目的地",allIndustries:"全部行业",allStatuses:"全部状态",destinationsTitle:"投资目的地",destinationsSubtitle:"通过互动地图和目的地排名探索中国对外投资分布。",globalDistribution:"全球投资分布",clickMarkers:"点击地图标记或目的地列表查看交易。",rankedByValue:"按投资金额排序",selectDestination:"选择一个目的地",selectDestinationSub:"点击地图标记或右侧列表以查看相关交易。",destinationSnapshot:"目的地概览",destinationSnapshotSub:"当前数据快照中的全球覆盖情况",insightsTitle:"M&A 洞察",insightsSubtitle:"基于内置数据快照，对并购活动进行离线概览。",maTopDestinations:"M&A 主要目的地",maTopDestinationsSub:"按披露交易金额排序",maTopIndustries:"M&A 主要行业",maTopIndustriesSub:"按交易数量排序",offlineFooter:"静态离线版本 · 数据已内置于本地文件",totalDeals:"总交易数",totalValue:"总投资额",topDestination:"主要目的地",topIndustry:"主要行业",maDeals:"并购交易",greenfield:"绿地投资",other:"其他投资",destinations:"目的地数",deals:"笔交易",details:"交易详情",announcement:"公告日期",exchange:"交易所",province:"投资方省份",rationale:"投资理由",announcementTitle:"公告标题",noData:"暂无数据",page:"页",of:"共",showing:"显示",newProject:"新项目",maValue:"M&A 总金额",maShare:"M&A 占比",largestMA:"最大 M&A 交易",records:"条记录" },
    en: { navOverview:"Overview",navDeals:"Deals Database",navDestinations:"Destinations",navInsights:"M&A Insights",offlineBadge:"Offline data snapshot",offlineNote:"Offline mode: data, map and interactions run entirely on this device",overviewTitle:"China Outbound Investment Dashboard",overviewSubtitle:"Explore the built-in investment dataset without a database or internet connection.",monthlyTrend:"Monthly Deal Trend",monthlyTrendSub:"M&A and greenfield deal counts by month",topDestinations:"Top Destinations",topDestinationsSub:"Ranked by disclosed investment value",largestDeals:"Top Deals",largestDealsSub:"Six largest transactions by disclosed value",date:"Date",type:"Type",investor:"Investor",target:"Target",destination:"Destination",industry:"Industry",dealValue:"Deal Value",status:"Status",dealsTitle:"Deals Database",dealsSubtitle:"Search the built-in Chinese outbound investment deal records.",searchPlaceholder:"Search by investor, target, or destination…",allTypes:"All Types",allDestinations:"All Destinations",allIndustries:"All Industries",allStatuses:"All Statuses",destinationsTitle:"Investment Destinations",destinationsSubtitle:"Explore Chinese outbound investment distribution through an interactive map and rankings.",globalDistribution:"Global Investment Distribution",clickMarkers:"Click a map marker or destination list item to view deals.",rankedByValue:"Ranked by investment value",selectDestination:"Select a destination",selectDestinationSub:"Click a map marker or the list at right to view related deals.",destinationSnapshot:"Destination Snapshot",destinationSnapshotSub:"Global coverage in the current data snapshot",insightsTitle:"M&A Insights",insightsSubtitle:"An offline overview of merger and acquisition activity from the built-in dataset.",maTopDestinations:"Top M&A Destinations",maTopDestinationsSub:"Ranked by disclosed transaction value",maTopIndustries:"Top M&A Industries",maTopIndustriesSub:"Ranked by deal count",offlineFooter:"Static offline edition · data is embedded locally",totalDeals:"Total Deals",totalValue:"Total Value",topDestination:"Top Destination",topIndustry:"Top Industry",maDeals:"M&A Deals",greenfield:"Greenfield",other:"Other",destinations:"Destinations",deals:"deals",details:"Deal Details",announcement:"Announcement Date",exchange:"Exchange",province:"Investor Province",rationale:"Investment Rationale",announcementTitle:"Announcement Title",noData:"No data available",page:"Page",of:"of",showing:"Showing",newProject:"New project",maValue:"M&A Value",maShare:"M&A Share",largestMA:"Largest M&A Deal",records:"records" }
  };
  const COUNTRY_EN = { "英国":"United Kingdom","巴西":"Brazil","中国香港":"Hong Kong (PRC)","香港":"Hong Kong (PRC)","尼日利亚":"Nigeria","新加坡":"Singapore","哈萨克斯坦":"Kazakhstan","荷兰":"Netherlands","越南":"Vietnam","泰国":"Thailand","沙特阿拉伯":"Saudi Arabia","俄罗斯":"Russia","印度尼西亚":"Indonesia","乌兹别克斯坦":"Uzbekistan","澳大利亚":"Australia","伊拉克":"Iraq","韩国":"South Korea","开曼群岛":"Cayman Islands","德国":"Germany","马里":"Mali","法国":"France","埃及":"Egypt","突尼斯":"Tunisia","阿联酋":"United Arab Emirates","摩洛哥":"Morocco","卢森堡":"Luxembourg","智利":"Chile","美国":"United States","马来西亚":"Malaysia","丹麦":"Denmark","加拿大":"Canada","阿根廷":"Argentina","刚果民主共和国":"Democratic Republic of the Congo","刚果（金）":"Democratic Republic of the Congo","秘鲁":"Peru","墨西哥":"Mexico","西班牙":"Spain","柬埔寨":"Cambodia","比利时":"Belgium","尼泊尔":"Nepal","哥伦比亚":"Colombia","坦桑尼亚":"Tanzania","日本":"Japan","新西兰":"New Zealand","老挝":"Laos","孟加拉国":"Bangladesh","意大利":"Italy","保加利亚":"Bulgaria","捷克":"Czech Republic","英属维尔京群岛":"British Virgin Islands","罗马尼亚":"Romania","南非":"South Africa","南非共和国":"South Africa","巴基斯坦":"Pakistan","希腊":"Greece","塞舌尔":"Seychelles","爱尔兰":"Ireland","萨摩亚":"Samoa","印度":"India","土耳其":"Türkiye","波兰":"Poland","匈牙利":"Hungary","塞尔维亚":"Serbia","葡萄牙":"Portugal","中国":"China" };
  const STATUS_EN = { "完成":"Completed", "筹划":"Planning", "进展":"In Progress", "终止":"Terminated" };
  const COORDS = { "英国":[36,25],"巴西":[24,57],"中国香港":[75,42],"香港":[75,42],"尼日利亚":[40,47],"新加坡":[77,51],"哈萨克斯坦":[58,29],"荷兰":[37,22],"越南":[73,43],"泰国":[71,46],"沙特阿拉伯":[51,39],"俄罗斯":[58,18],"印度尼西亚":[76,52],"乌兹别克斯坦":[57,33],"澳大利亚":[83,68],"伊拉克":[52,35],"韩国":[78,34],"开曼群岛":[19,41],"德国":[39,24],"马里":[35,44],"法国":[38,27],"埃及":[45,40],"突尼斯":[40,36],"阿联酋":[54,41],"摩洛哥":[32,34],"卢森堡":[39,24],"智利":[21,68],"美国":[14,32],"马来西亚":[75,49],"丹麦":[39,20],"加拿大":[13,18],"阿根廷":[25,69],"刚果民主共和国":[45,54],"刚果（金）":[45,54],"秘鲁":[20,55],"墨西哥":[12,42],"西班牙":[35,29],"柬埔寨":[72,46],"比利时":[38,24],"尼泊尔":[66,38],"哥伦比亚":[18,49],"坦桑尼亚":[48,58],"日本":[81,34],"新西兰":[91,73],"老挝":[72,43],"孟加拉国":[68,41],"意大利":[41,30],"保加利亚":[44,27],"捷克":[41,25],"英属维尔京群岛":[20,40],"罗马尼亚":[44,26],"南非":[44,66],"南非共和国":[44,66],"巴基斯坦":[62,39],"希腊":[43,31],"塞舌尔":[52,61],"爱尔兰":[33,21],"萨摩亚":[96,60],"印度":[65,45],"土耳其":[47,30],"波兰":[41,23],"匈牙利":[43,27],"塞尔维亚":[43,29],"葡萄牙":[33,31] };
  const esc = value => String(value ?? "").replace(/[&<>]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[char])).replaceAll('"', '&quot;');
  const t = key => TEXT[locale.lang][key] || key;
  const translateCountry = value => locale.lang === "en" ? (COUNTRY_EN[value] || value || "—") : (value || "—");
  const translateStatus = value => locale.lang === "en" ? (STATUS_EN[value] || value || "—") : (value || "—");
  const amount = value => { const number = Number.parseFloat(value); if (!Number.isFinite(number) || number === 0) return "—"; const sign = number < 0 ? "-" : ""; const abs = Math.abs(number); return sign + (abs >= 1e9 ? "$" + (abs/1e9).toFixed(1) + "B" : abs >= 1e6 ? "$" + (abs/1e6).toFixed(1) + "M" : abs >= 1e3 ? "$" + (abs/1e3).toFixed(1) + "K" : "$" + abs.toFixed(0)); };
  const numeric = record => Number.parseFloat(record.deal_size_usd) || 0;
  const DESTINATION_ALIASES = { "香港":"中国香港", "香港特别行政区":"中国香港", "中国香港特别行政区":"中国香港", "阿拉伯联合酋长国":"阿联酋", "南非共和国":"南非", "刚果（金）":"刚果民主共和国" };
  const TYPE_NORMALIZATION = { "Joint Venture":"Other", "Capital Increase":"Other" };
  const normalized = RAW_DATA.filter(record => {
    const code = String(record?.target_country_code || "").trim();
    const name = String(record?.target_country_name || "").trim();
    return /^[A-Z]{2}$/.test(code) && code !== "CN" && name && name !== "未知";
  }).map((record, index) => ({
    ...record,
    id:index + 1,
    original_investment_type:record.investment_type,
    investment_type:TYPE_NORMALIZATION[record.investment_type] || record.investment_type || "Other",
    target_country_name:DESTINATION_ALIASES[record.target_country_name] || record.target_country_name,
    value:numeric(record),
    date:record.announcement_date || ""
  }));
  const sum = records => records.reduce((total, record) => total + record.value, 0);
  const groupBy = (records,key) => Object.values(records.reduce((groups,record) => { const name = record[key] || "未知"; (groups[name] ||= []).push(record); return groups; },{}));
  const destinationStats = records => groupBy(records,"target_country_name").map(items => ({ name:items[0].target_country_name || "未知", count:items.length, total:sum(items), records:items })).sort((a,b) => b.total - a.total);
  const industryStats = records => groupBy(records,"company_industry").map(items => ({ name:items[0].company_industry || "未知", count:items.length, total:sum(items), records:items })).sort((a,b) => b.total - a.total);
  const statusClass = value => { const current = STATUS_EN[value] || value; return current === "Completed" ? "completed" : current === "Planning" ? "planning" : "progress"; };
  const typeClass = value => value === "M&A" ? "ma" : value === "Greenfield" ? "gf" : "other";
  const badge = (value, kind="type") => '<span class="badge ' + (kind === "type" ? typeClass(value) : statusClass(value)) + '">' + esc(kind === "type" ? value : translateStatus(value)) + '</span>';
  function metric(label,value,minor,accent,icon) { return '<article class="metric" style="--accent:' + accent + '"><span class="icon">' + icon + '</span><div class="label">' + esc(label) + '</div><div class="value">' + esc(value) + '</div><div class="minor">' + esc(minor || "") + '</div></article>'; }
  function renderOverview() { const destinations=destinationStats(normalized); const industries=industryStats(normalized); const ma=normalized.filter(d=>d.investment_type==="M&A"),gf=normalized.filter(d=>d.investment_type==="Greenfield"),other=normalized.filter(d=>d.investment_type==="Other"); document.getElementById("overviewMetrics").innerHTML=[metric(t("totalDeals"),String(normalized.length),t("records"),"#2e7df6","⌁"),metric(t("totalValue"),amount(sum(normalized)),"", "#2e7df6","$"),metric(t("topDestination"),translateCountry(destinations[0]?.name),amount(destinations[0]?.total),"#8757e8","⌖"),metric(t("topIndustry"),industries[0]?.name || "—",String(industries[0]?.count || 0) + " " + t("deals"),"#15b989","▥")].join(""); const months={}; normalized.forEach(d=>{const key=(d.date||"").slice(0,7); if(!key)return; months[key] ||= {ma:0,gf:0}; if(d.investment_type==="M&A")months[key].ma++; if(d.investment_type==="Greenfield")months[key].gf++;}); const values=Object.entries(months).sort(([a],[b])=>a.localeCompare(b)); const max=Math.max(...values.map(([,v])=>Math.max(v.ma,v.gf)),1); document.getElementById("monthlyChart").innerHTML=values.map(([key,value])=>'<div class="bar-group" title="' + key + ': M&A ' + value.ma + ', Greenfield ' + value.gf + '"><div class="bar ma" style="height:' + (value.ma/max*100) + '%"></div><div class="bar gf" style="height:' + (value.gf/max*100) + '%"></div><label>' + esc(key.slice(5)) + '</label></div>').join(""); document.getElementById("destinationRanking").innerHTML=ranking(destinations.slice(0,8),true); document.getElementById("largestDealsTable").innerHTML=normalized.slice().sort((a,b)=>b.value-a.value).slice(0,6).map(row=>'<tr data-deal="' + row.id + '"><td>' + esc(row.date) + '</td><td><b>' + esc(row.company_name || "—") + '</b></td><td>' + esc(translateCountry(row.target_country_name)) + '</td><td>' + esc(row.company_industry || "—") + '</td><td class="value">' + amount(row.value) + '</td></tr>').join(""); }
  function ranking(stats,asAmount) { const max=Math.max(...stats.map(item=>asAmount?item.total:item.count),1); return stats.map((item,index)=>{const value=asAmount?item.total:item.count;return '<div class="rank-row"><span class="rank-no">' + (index+1) + '</span><div><div class="rank-name" title="' + esc(translateCountry(item.name)) + '">' + esc(translateCountry(item.name)) + '</div><div class="rank-track"><div class="rank-fill" style="width:' + (value/max*100) + '%"></div></div></div><span class="rank-value">' + (asAmount?amount(value):value + " " + t("deals")) + '</span></div>';}).join(""); }
  function buildFilters() { const select=(id,label,values,formatter=value=>value)=>{document.getElementById(id).innerHTML='<option value="">' + esc(label) + '</option>' + values.map(value=>'<option value="' + esc(value) + '">' + esc(formatter(value)) + '</option>').join("");}; select("typeFilter",t("allTypes"),["M&A","Greenfield","Other"]);select("destinationFilter",t("allDestinations"),[...new Set(normalized.map(d=>d.target_country_name).filter(Boolean))].sort(),translateCountry);select("industryFilter",t("allIndustries"),[...new Set(normalized.map(d=>d.company_industry).filter(Boolean))].sort());select("statusFilter",t("allStatuses"),[...new Set(normalized.map(d=>d.announcement_stage).filter(Boolean))].sort(),translateStatus); }
  function renderDeals(reset=false) { if(reset) locale.dealsPage=1; const search=document.getElementById("searchInput").value.trim().toLowerCase(); const filters={ type:document.getElementById("typeFilter").value,destination:document.getElementById("destinationFilter").value,industry:document.getElementById("industryFilter").value,status:document.getElementById("statusFilter").value}; locale.filteredDeals=normalized.filter(d=> (!filters.type||d.investment_type===filters.type)&&(!filters.destination||d.target_country_name===filters.destination)&&(!filters.industry||d.company_industry===filters.industry)&&(!filters.status||d.announcement_stage===filters.status)&&(!search||[d.company_name,d.target_name,d.target_country_name].some(v=>String(v||"").toLowerCase().includes(search)))).sort((a,b)=>String(b.date).localeCompare(String(a.date))); const size=12,totalPages=Math.max(1,Math.ceil(locale.filteredDeals.length/size)); locale.dealsPage=Math.min(locale.dealsPage,totalPages); const items=locale.filteredDeals.slice((locale.dealsPage-1)*size,locale.dealsPage*size); document.getElementById("dealsTable").innerHTML=items.map(row=>'<tr data-deal="' + row.id + '"><td>' + esc(row.date) + '</td><td>' + badge(row.investment_type) + '</td><td><b>' + esc(row.company_name || "—") + '</b></td><td>' + esc(row.target_name || t("newProject")) + '</td><td>' + esc(translateCountry(row.target_country_name)) + '</td><td>' + esc(row.company_industry || "—") + '</td><td class="value">' + amount(row.value) + '</td><td>' + badge(row.announcement_stage,"status") + '</td></tr>').join("") || '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:28px">' + t("noData") + '</td></tr>'; document.getElementById("dealsCount").textContent=t("showing") + " " + items.length + " / " + locale.filteredDeals.length + " · " + t("page") + " " + locale.dealsPage + " " + t("of") + " " + totalPages; document.getElementById("prevPage").disabled=locale.dealsPage===1; document.getElementById("nextPage").disabled=locale.dealsPage===totalPages; }
  function renderDestinations() { const stats=destinationStats(normalized); const ma=normalized.filter(d=>d.investment_type==="M&A"),gf=normalized.filter(d=>d.investment_type==="Greenfield"); document.getElementById("destinationMetrics").innerHTML=[metric(t("destinations"),String(stats.length),"", "#2e7df6","⌖"),metric(t("totalValue"),amount(sum(normalized)),"", "#2e7df6","$"),metric(t("maDeals"),String(ma.length),amount(sum(ma)),"#8757e8","▥"),metric(t("greenfield"),String(gf.length),amount(sum(gf)),"#15b989","▤")].join(""); const max=Math.max(...stats.map(s=>s.total),1); const map=document.getElementById("mapShell");map.style.backgroundImage='url("'+WORLD_MAP+'")';map.innerHTML=stats.filter(s=>COORDS[s.name]).map(s=>{const [left,top]=COORDS[s.name];const size=15+Math.sqrt(s.total/max)*33;return '<button type="button" class="map-marker" data-destination="' + esc(s.name) + '" style="left:' + left + '%;top:' + top + '%;width:' + size + 'px;height:' + size + 'px"><span><b>' + esc(translateCountry(s.name)) + '</b>' + s.count + ' ' + t("deals") + ' · ' + amount(s.total) + '</span></button>';}).join("");document.getElementById("destinationList").innerHTML=stats.map(s=>'<button type="button" class="destination-item' + (locale.selectedDestination===s.name?" active":"") + '" data-destination="' + esc(s.name) + '"><span><b>' + esc(translateCountry(s.name)) + '</b><br><small>' + s.count + ' ' + t("deals") + '</small></span><b>' + amount(s.total) + '</b></button>').join("");document.getElementById("industryRanking").innerHTML=ranking(industryStats(normalized).slice(0,8),true); renderDestinationDetail(); }
  function renderDestinationDetail() { const detail=document.getElementById("destinationDetail"),empty=document.getElementById("destinationEmpty"); if(!locale.selectedDestination){detail.classList.remove("active");empty.style.display="grid";return;} const records=normalized.filter(d=>d.target_country_name===locale.selectedDestination).sort((a,b)=>b.value-a.value); const ma=records.filter(d=>d.investment_type==="M&A").length,gf=records.filter(d=>d.investment_type==="Greenfield").length; empty.style.display="none";detail.classList.add("active");detail.innerHTML='<div class="panel-title"><div><h2>' + esc(translateCountry(locale.selectedDestination)) + '</h2><p>' + records.length + ' ' + t("deals") + ' · ' + amount(sum(records)) + '</p></div></div><div class="callout" style="display:flex;gap:24px;margin-bottom:14px"><div><b>' + ma + '</b><p>M&A</p></div><div><b>' + gf + '</b><p>Greenfield</p></div></div>' + records.slice(0,10).map(d=>'<div class="mini-deal"><button type="button" data-deal="' + d.id + '"><b>' + esc(d.company_name || "—") + '</b><p>' + esc(d.target_name || t("newProject")) + ' · ' + esc(d.date) + '</p><span>' + badge(d.investment_type) + ' <strong style="float:right">' + amount(d.value) + '</strong></span></button></div>').join(""); }
  function renderInsights() { const ma=normalized.filter(d=>d.investment_type==="M&A"), total=sum(normalized), sorted=ma.slice().sort((a,b)=>b.value-a.value); document.getElementById("insightCards").innerHTML='<article class="callout"><b>' + ma.length + '</b><p>' + t("maDeals") + '</p></article><article class="callout"><b>' + amount(sum(ma)) + '</b><p>' + t("maValue") + '</p></article><article class="callout"><b>' + (total?Math.round(sum(ma)/total*100):0) + '%</b><p>' + t("maShare") + '</p></article><article class="callout"><b>' + esc(sorted[0]?.company_name || "—") + '</b><p>' + t("largestMA") + ' · ' + amount(sorted[0]?.value) + '</p></article><article class="callout"><b>' + destinationStats(ma).length + '</b><p>' + t("destinations") + '</p></article><article class="callout"><b>' + industryStats(ma).length + '</b><p>' + t("industry") + '</p></article>'; document.getElementById("maDestinationRanking").innerHTML=ranking(destinationStats(ma).slice(0,8),true);document.getElementById("maIndustryRanking").innerHTML=ranking(industryStats(ma).slice(0,8),false); }
  function showModal(id) { const item=normalized.find(d=>d.id===Number(id));if(!item)return; document.getElementById("modalTitle").textContent=item.company_name||"—";document.getElementById("modalSubtitle").textContent=(item.target_name||t("newProject"))+" · "+translateCountry(item.target_country_name);const pairs=[[t("announcement"),item.date],[t("type"),item.investment_type],[t("status"),translateStatus(item.announcement_stage)],[t("dealValue"),amount(item.value)],[t("target"),item.target_name||t("newProject")],[t("destination"),translateCountry(item.target_country_name)],[t("industry"),item.company_industry],[t("exchange"),item.exchange],[t("province"),item.company_province],[t("announcementTitle"),item.announcement_title],[t("rationale"),item.investment_rationale]];document.getElementById("modalDetails").innerHTML=pairs.map(([label,value])=>'<div class="' + (label===t("rationale")||label===t("announcementTitle")?"wide":"") + '"><dt>' + esc(label) + '</dt><dd>' + esc(value||"—") + '</dd></div>').join("");document.getElementById("detailModal").classList.add("open"); }
  function applyLanguage() { document.documentElement.lang=locale.lang==="zh"?"zh-CN":"en"; document.getElementById("languageToggle").textContent=locale.lang==="zh"?"EN":"中文"; document.querySelectorAll("[data-i18n]").forEach(element=>element.textContent=t(element.dataset.i18n));document.querySelectorAll("[data-i18n-placeholder]").forEach(element=>element.placeholder=t(element.dataset.i18nPlaceholder)); buildFilters();renderOverview();renderDeals(true);renderDestinations();renderInsights(); }
  document.addEventListener("click",event=>{ const pageButton=event.target.closest("[data-page]");if(pageButton){locale.page=pageButton.dataset.page;document.querySelectorAll(".nav button").forEach(button=>button.classList.toggle("active",button===pageButton));document.querySelectorAll(".page").forEach(page=>page.classList.toggle("active",page.id===locale.page+"Page"));window.scrollTo({top:0,behavior:"smooth"});return;} const deal=event.target.closest("[data-deal]");if(deal){showModal(deal.dataset.deal);return;} const destination=event.target.closest("[data-destination]");if(destination){locale.selectedDestination=destination.dataset.destination;renderDestinations();return;} if(event.target.id==="modalClose"||event.target.id==="detailModal")document.getElementById("detailModal").classList.remove("open"); });
  document.getElementById("languageToggle").addEventListener("click",()=>{locale.lang=locale.lang==="zh"?"en":"zh";applyLanguage();});document.getElementById("searchInput").addEventListener("input",()=>renderDeals(true));["typeFilter","destinationFilter","industryFilter","statusFilter"].forEach(id=>document.getElementById(id).addEventListener("change",()=>renderDeals(true)));document.getElementById("prevPage").addEventListener("click",()=>{locale.dealsPage--;renderDeals();});document.getElementById("nextPage").addEventListener("click",()=>{locale.dealsPage++;renderDeals();});document.addEventListener("keydown",event=>{if(event.key==="Escape")document.getElementById("detailModal").classList.remove("open");});
  applyLanguage();
  </script>
</body>
</html>`;

writeFileSync(resolve(releaseRoot, "index.html"), html);
writeFileSync(resolve(releaseRoot, "README.md"), `# China ODI Dashboard — Static Offline Edition

## Start here

This edition runs **without a database, Node.js, an API server, or an internet connection**. After extracting the ZIP file, double-click \`index.html\` to open it in a modern browser.

## What is included

| Item | Description |
| --- | --- |
| \`index.html\` | Fully self-contained offline dashboard. It embeds the investment data and world map. |
| \`data/investments.json\` | Original source JSON snapshot for inspection or reuse. |
| \`LICENSE\` | MIT License. |

## Offline behavior

The overview, filters, deal detail dialog, destination map, rankings, pagination, and Chinese/English interface switch all run locally in the browser. Automatic LLM-based translation is intentionally unavailable offline; the original source text remains visible in detail fields.

## Data snapshot

The embedded data comes from the project source JSON and contains ${investments.length} raw investment records. The dashboard excludes records whose destination is China to match the project’s outbound-investment presentation logic.

## Notes

Do not open \`data/investments.json\` directly expecting the dashboard to refresh. The application intentionally embeds its own snapshot so it can operate directly from \`file://\` without browser fetch restrictions.
`);

console.log(`Offline release created: ${releaseRoot}`);
console.log(`Embedded data records: ${investments.length}`);
