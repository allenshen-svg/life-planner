/* ═══ 时光记 · Vue App ═══ */
const { createApp, ref, computed, onMounted, watch, nextTick } = Vue;

const API = '';  // unused, kept for compat

// ─── localStorage helpers ───
function lsLoad(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } }
function lsSave(key, arr) { localStorage.setItem(key, JSON.stringify(arr)); }
function lsObj(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }

// ─── Avatar Gallery ───
const AVATARS = [
  '🐱','🐶','🐰','🦊','🐻','🐼','🐨','🐯',
  '🦁','🐸','🐧','🐦','🦄','🐝','🐙','🦋',
  '🌸','🌻','🌈','⭐','🍀','🎀','🧸','🎨',
  '🎵','🌙','☀️','🍎','🍩','🧁','🎪','🪐',
];

const MOODS = [
  { key: 'great',   emoji: '😄', label: t('mood.great') },
  { key: 'good',    emoji: '🙂', label: t('mood.good') },
  { key: 'neutral', emoji: '😐', label: t('mood.neutral') },
  { key: 'sad',     emoji: '😔', label: t('mood.sad') },
  { key: 'angry',   emoji: '😤', label: t('mood.angry') },
  { key: 'anxious', emoji: '😰', label: t('mood.anxious') },
  { key: 'love',    emoji: '🥰', label: t('mood.love') },
];

const ALL_TAGS = ['reading','fitness','running','dating','work','study','travel','shopping','food','movie','music','gaming','housework','relax','overtime','dinner_party'].map(k => t('tag.' + k));

// ─── Activity key → category mapping ───
const ACT_CAT = {
  visit_exhibition:'other', eat_hotpot:'food', walk_dog:'other', stroll_park:'other',
  running:'exercise', drink_coffee:'food', watch_movie:'other', camping:'travel',
  explore_shops:'food', cycling:'exercise', eat_bbq:'food', eat_japanese:'food',
  eat_western:'food', afternoon_tea:'food', eat_dimsum:'food', eat_sichuan:'food',
  eat_cantonese:'food', eat_dessert:'food', drink_milktea:'food',
  go_mall:'shopping', go_supermarket:'shopping', go_market:'shopping',
  buy_clothes:'shopping', go_bookstore:'shopping', go_flower_market:'shopping',
  watch_show:'other', concert:'other', watch_drama:'other',
  visit_museum:'other', visit_gallery:'other', watch_standup:'other',
  karaoke:'other', escape_room:'other', script_murder:'other',
  gym:'exercise', swimming:'exercise', badminton:'exercise', basketball:'exercise',
  hiking:'exercise', yoga:'exercise', skateboarding:'exercise',
  rock_climbing:'exercise', frisbee:'exercise',
  picnic:'travel', fishing:'other', walking:'exercise',
  ride_around:'other', watch_sunset:'other', fly_kite:'other',
  friends_dinner:'social', family_gathering:'social', dating:'social',
  meet_client:'work', team_building:'social', house_party:'social',
  haircut:'other', see_doctor:'other', car_wash:'other', moving:'other',
  housework:'other', send_package:'other', get_documents:'other',
  attend_class:'work', self_study:'work', meeting:'work', interview:'work',
  code:'work', draw:'work', play_piano:'work', calligraphy:'work',
  take_train:'travel', take_flight:'travel', road_trip:'travel',
  visit_scenic:'travel', hot_spring:'travel', stay_bnb:'travel',
};
function tAct(key) { return t('act.' + key); }

// ─── 预设活动（分类） ───
const ACTIVITY_GROUPS = [
  { label: '🔥 ' + t('actg.popular'), items: ['visit_exhibition','eat_hotpot','walk_dog','stroll_park','running','drink_coffee','watch_movie','camping','explore_shops','cycling'].map(tAct) },
  { label: '🍜 ' + t('actg.food'), items: ['eat_hotpot','eat_bbq','drink_coffee','eat_japanese','eat_western','afternoon_tea','eat_dimsum','eat_sichuan','eat_cantonese','explore_shops','eat_dessert','drink_milktea'].map(tAct) },
  { label: '🛍 ' + t('actg.shopping'), items: ['go_mall','go_supermarket','go_market','buy_clothes','go_bookstore','go_flower_market'].map(tAct) },
  { label: '🎬 ' + t('actg.entertainment'), items: ['watch_movie','visit_exhibition','watch_show','concert','watch_drama','visit_museum','visit_gallery','watch_standup','karaoke','escape_room','script_murder'].map(tAct) },
  { label: '🏃 ' + t('actg.sports'), items: ['running','gym','swimming','badminton','basketball','cycling','hiking','yoga','skateboarding','rock_climbing','frisbee'].map(tAct) },
  { label: '🌳 ' + t('actg.outdoors'), items: ['stroll_park','picnic','camping','fishing','walk_dog','walking','ride_around','watch_sunset','fly_kite'].map(tAct) },
  { label: '👫 ' + t('actg.social'), items: ['friends_dinner','family_gathering','dating','meet_client','team_building','house_party'].map(tAct) },
  { label: '🏠 ' + t('actg.life'), items: ['haircut','see_doctor','car_wash','moving','housework','send_package','get_documents'].map(tAct) },
  { label: '📚 ' + t('actg.study'), items: ['attend_class','self_study','meeting','interview','code','draw','play_piano','calligraphy'].map(tAct) },
  { label: '✈️ ' + t('actg.travel'), items: ['take_train','take_flight','road_trip','visit_scenic','hot_spring','stay_bnb'].map(tAct) },
];
// flat list for search
const ACTIVITIES = ACTIVITY_GROUPS.flatMap(g => g.items);
// Reverse lookup: translated name → category
const _actCatByName = {};
for (const [k, c] of Object.entries(ACT_CAT)) { _actCatByName[tAct(k)] = c; }

// ─── 城市列表 ───
const CITIES = [
  '上海','北京','广州','深圳','杭州','成都','南京','武汉','重庆','西安',
  '苏州','长沙','青岛','厦门','大连','昆明','三亚','贵阳','郑州','天津',
  '哈尔滨','沈阳','济南','福州','合肥','南昌','无锡','东莞','宁波','佛山',
  '珠海','中山','惠州','常州','温州','绍兴','嘉兴','烟台','威海','桂林',
  '丽江','大理','拉萨','敦煌','张家界','黄山','洛阳','泉州','香港','澳门','台北',
];

// ─── 热门地标 ───
const LANDMARKS = {
  '上海': ['南京路步行街','外滩','陆家嘴','豫园','田子坊','新天地','静安寺','武康路','淮海中路','人民广场','上海迪士尼','环球港','大悦城','龙华寺','世博源','中山公园','虹桥天地','七宝古镇','朱家角','Columbia Circle','安福路','长乐路','愚园路','南京西路','徐家汇','五角场','金桥','前滩太古里','北外滩','西岸','M50','1933老场坊','思南公馆','上海图书馆','复兴公园','衡山路','永康路','甜爱路'],
  '北京': ['故宫','天安门广场','颐和园','南锣鼓巷','王府井','三里屯','后海','798艺术区','圆明园','鸟巢','天坛','前门大街','五道营胡同','簋街','国贸','望京','西单','蓝色港湾','朝阳大悦城','什刹海','烟袋斜街','北海公园','恭王府','雍和宫'],
  '广州': ['北京路步行街','珠江新城','天河城','正佳广场','沙面','荔枝湾','陈家祠','中山纪念堂','上下九','白云山','广州塔','花城汇','太古汇','东山口','永庆坊','小蛮腰','天河体育中心','岭南印象园'],
  '深圳': ['东门步行街','华强北','南山','海岸城','万象城','世界之窗','欢乐谷','大梅沙','海上世界','深圳湾公园','莲花山公园','东部华侨城','甘坑客家小镇','中心书城','海雅缤纷城','壹方城','万象天地','前海'],
  '杭州': ['西湖','河坊街','南宋御街','灵隐寺','龙井村','断桥','雷峰塔','湖滨银泰','武林广场','钱江新城','西溪湿地','良渚古城','天目山路','万象城','来福士','滨江宝龙城','拱墅万达'],
  '成都': ['春熙路','太古里','宽窄巷子','锦里','武侯祠','大熊猫基地','人民公园','文殊院','九眼桥','玉林路','IFS','天府广场','建设路','望平街','东郊记忆','三圣花乡','言几又','方所'],
  '南京': ['新街口','夫子庙','秦淮河','中山陵','玄武湖','总统府','老门东','鸡鸣寺','先锋书店','德基广场','紫峰大厦','南京眼','1912街区','明故宫','牛首山','百家湖'],
  '武汉': ['户部巷','黄鹤楼','楚河汉街','东湖','光谷','江汉路步行街','武汉长江大桥','昙华林','汉正街','武汉天地','汉口江滩','古德寺','武汉大学'],
  '重庆': ['解放碑','洪崖洞','磁器口','长江索道','观音桥','南山一棵树','鹅岭二厂','交通茶馆','来福士','李子坝站','十八梯','山城步道','龙门浩老街','弹子石老街'],
  '西安': ['大雁塔','回民街','钟楼鼓楼','城墙','陕西历史博物馆','大唐不夜城','永兴坊','小寨','曲江池','大明宫','长安十二时辰','赛格国际','高新万达'],
  '苏州': ['拙政园','平江路','观前街','虎丘','寒山寺','山塘街','金鸡湖','诚品书店','狮子林','留园','周庄','同里古镇','木渎古镇','苏州中心'],
  '长沙': ['五一广场','太平老街','岳麓山','橘子洲','IFS','国金中心','坡子街','黄兴路步行街','梅溪湖','湖南省博物馆','文和友','茶颜悦色(总店)'],
  '三亚': ['亚龙湾','海棠湾','天涯海角','南山寺','蜈支洲岛','第一市场','大东海','后海村','千古情景区','免税城','鹿回头','凤凰岛'],
  '厦门': ['鼓浪屿','中山路','曾厝垵','南普陀寺','厦门大学','环岛路','沙坡尾','八市','万象城','集美学村','五缘湾','筼筜湖'],
};
// Helper: get landmarks for current city + generic places
function getCityLandmarks(city) {
  return LANDMARKS[city] || [];
}

function toLocalDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function today() { return toLocalDate(new Date()); }

// ─── Hot Events Database (by city, sorted by heat) ───
const HOT_EVENTS = {
  '上海': [
    // 演唱会
    { title: '周杰伦「嘉年华」世界巡回演唱会', tag: '演唱会', icon: '🎤', heat: 99, date: '5月10日', loc: '上海体育场',
      addr: '徐汇区天钥桥路666号', docs: '身份证/大麦电子票', route: '地铁4号线上海体育场站', tips: '大麦网抢票，开售秒空，注意实名制' },
    { title: '薛之谦「天外来物」巡演上海站', tag: '演唱会', icon: '🎵', heat: 96, date: '4月19日', loc: '梅赛德斯奔驰文化中心',
      addr: '浦东新区世博大道1200号', docs: '身份证/电子票', route: '地铁8号线中华艺术宫站', tips: '内场票视野最佳，提前2小时入场' },
    { title: '林俊杰「JJ20」世界巡回演唱会', tag: '演唱会', icon: '🎤', heat: 95, date: '6月7日', loc: '上海体育场',
      addr: '徐汇区天钥桥路666号', docs: '身份证/电子票', route: '地铁4号线上海体育场站', tips: '带荧光棒，散场地铁延时运营' },
    { title: '草莓音乐节', tag: '演唱会', icon: '🍓', heat: 93, date: '5月1-3日', loc: '浦东世博公园',
      addr: '浦东新区世博大道1750号', docs: '身份证/电子票', route: '地铁13号线世博大道站', tips: '穿舒适的鞋，带防晒和雨具' },
    { title: '张学友60+巡回演唱会', tag: '演唱会', icon: '🎤', heat: 92, date: '7月', loc: '上海体育馆',
      addr: '徐汇区漕溪北路1111号', docs: '身份证/电子票', route: '地铁1号线上海体育馆站', tips: '歌神现场超稳，建议带望远镜' },
    { title: 'BLACKPINK回归巡演上海站', tag: '演唱会', icon: '💖', heat: 91, date: '8月', loc: '梅赛德斯奔驰文化中心',
      addr: '浦东新区世博大道1200号', docs: '身份证/护照/电子票', route: '地铁8号线中华艺术宫站', tips: '韩团演出禁止专业相机，可带手幅' },
    { title: '五月天「诺亚方舟10th」演唱会', tag: '演唱会', icon: '🎸', heat: 90, date: '9月', loc: '上海体育场',
      addr: '徐汇区天钥桥路666号', docs: '身份证/电子票', route: '地铁4号线上海体育场站', tips: '五迷提前做好万人大合唱准备' },
    // 展会
    { title: 'ChinaJoy 2026 游戏展', tag: '展会', icon: '🎮', heat: 98, date: '4月', loc: '浦东新国际博览中心',
      addr: '浦东新区龙阳路2345号', docs: '身份证/电子票', route: '地铁7号线花木路站', tips: '建议早到避开排队，自带水' },
    { title: '上海国际电影节', tag: '展会', icon: '🎬', heat: 95, date: '6月', loc: '上海大剧院',
      addr: '黄浦区人民大道300号', docs: '身份证/购票凭证', route: '地铁1/2/8号线人民广场站', tips: '提前在淘票票抢票' },
    { title: '上海书展', tag: '展会', icon: '📚', heat: 82, date: '8月', loc: '上海展览中心',
      addr: '静安区延安中路1000号', docs: '身份证/门票', route: '地铁2/7号线静安寺站', tips: '工作日人少' },
    // 科技
    { title: 'Apple WWDC 线下观影', tag: '科技', icon: '🍎', heat: 92, date: '6月', loc: '静安嘉里中心',
      addr: '静安区南京西路1515号', docs: '无需证件，免费入场', route: '地铁2/7号线静安寺站', tips: '自带MacBook，现场有互动体验区' },
    { title: 'Google I/O Extended', tag: '科技', icon: '💻', heat: 85, date: '5月', loc: '张江科学城',
      addr: '浦东新区张江高科技园区', docs: '报名二维码', route: '地铁2号线张江高科站', tips: '提前在GDG官网报名' },
    // 运动
    { title: '上海马拉松', tag: '运动', icon: '🏃', heat: 88, date: '11月', loc: '外滩',
      addr: '黄浦区中山东一路', docs: '身份证/体检报告', route: '地铁2/10号线南京东路站', tips: '报名需上传体检报告' },
    { title: 'NBA 中国赛', tag: '运动', icon: '🏀', heat: 80, date: '10月', loc: '梅赛德斯奔驰文化中心',
      addr: '浦东新区世博大道1200号', docs: '身份证/电子票', route: '地铁8号线中华艺术宫站', tips: '场馆内禁止携带专业相机' },
    { title: '周末公益跑团', tag: '运动', icon: '👟', heat: 70, date: '每周六', loc: '世纪公园',
      addr: '浦东新区锦绣路1001号', docs: '无', route: '地铁2号线世纪公园站', tips: '早上7:30集合，免费参加' },
    // 美食
    { title: '上海环球美食节', tag: '美食', icon: '🍽️', heat: 86, date: '5月', loc: '新天地',
      addr: '黄浦区太仓路181号', docs: '无', route: '地铁10/13号线新天地站', tips: '100+摊位，带够现金和胃' },
    { title: '米其林指南发布晚宴', tag: '美食', icon: '⭐', heat: 78, date: '9月', loc: '外滩',
      addr: '黄浦区中山东一路', docs: '邀请函', route: '地铁2/10号线南京东路站', tips: '关注米其林官方公众号获取信息' },
    // 社交
    { title: 'WeWork 创业者之夜', tag: '社交', icon: '🤝', heat: 75, date: '每月', loc: '南京西路',
      addr: '静安区南京西路1601号', docs: '无需证件', route: '地铁2号线南京西路站', tips: '带名片，现场有自由交流环节' },
  ],
  '北京': [
    // 演唱会
    { title: '周杰伦「嘉年华」巡演北京站', tag: '演唱会', icon: '🎤', heat: 99, date: '6月14日', loc: '鸟巢',
      addr: '朝阳区国家体育场南路1号', docs: '身份证/大麦电子票', route: '地铁8号线奥体中心站', tips: '鸟巢8万人场次，提前3小时入场' },
    { title: '邓紫棋「I AM GLORIA」巡演', tag: '演唱会', icon: '🎤', heat: 95, date: '5月24日', loc: '五棵松体育馆',
      addr: '海淀区复兴路69号', docs: '身份证/电子票', route: '地铁1号线五棵松站', tips: '禁止携带荧光棒，可带手幅' },
    { title: '陈奕迅 Fear and Dreams 巡演', tag: '演唱会', icon: '🎵', heat: 94, date: '7月', loc: '国家体育馆',
      addr: '朝阳区天辰东路9号', docs: '身份证/电子票', route: '地铁8号线奥林匹克公园站', tips: 'Eason现场超有感染力' },
    { title: '五棵松演唱会季', tag: '演唱会', icon: '🎸', heat: 90, date: '5-8月', loc: '五棵松体育馆',
      addr: '海淀区复兴路69号', docs: '身份证/电子票', route: '地铁1号线五棵松站', tips: '多场演出密集，关注大麦网上新' },
    { title: 'Taylor Swift Eras Tour 亚洲加场', tag: '演唱会', icon: '💎', heat: 88, date: '9月', loc: '鸟巢',
      addr: '朝阳区国家体育场南路1号', docs: '身份证/护照/电子票', route: '地铁8号线奥体中心站', tips: '做好友谊手链交换Friendship Bracelet' },
    // 展会
    { title: 'GMIC 全球移动互联网大会', tag: '展会', icon: '🌐', heat: 96, date: '4月', loc: '国家会议中心',
      addr: '朝阳区天辰东路7号', docs: '身份证/邀请函', route: '地铁8号线奥林匹克公园站', tips: '提前官网注册免费票' },
    { title: '北京国际电影节', tag: '展会', icon: '🎬', heat: 94, date: '4月', loc: '中国电影博物馆',
      addr: '朝阳区南影路9号', docs: '身份证/电子票', route: '地铁15号线南法信站转公交', tips: '展映票开售即抢' },
    { title: '798 新媒体艺术展', tag: '展会', icon: '🎨', heat: 85, date: '全年', loc: '798艺术区',
      addr: '朝阳区酒仙桥路4号', docs: '部分展览需购票', route: '地铁14号线望京南站步行15分钟', tips: '工作日体验更好' },
    // 科技
    { title: '字节跳动技术沙龙', tag: '科技', icon: '💡', heat: 90, date: '每月', loc: '海淀区',
      addr: '海淀区北三环西路27号', docs: '报名二维码', route: '地铁10号线知春路站', tips: '关注ByteTech公众号' },
    // 运动
    { title: '国安主场比赛', tag: '运动', icon: '⚽', heat: 88, date: '周末', loc: '工人体育场',
      addr: '朝阳区工人体育场北路', docs: '身份证/电子票', route: '地铁2号线东四十条站', tips: '穿绿色助威' },
    { title: '北京马拉松', tag: '运动', icon: '🏃', heat: 86, date: '10月', loc: '天安门',
      addr: '东城区天安门广场', docs: '身份证/体检报告', route: '地铁1号线天安门东站', tips: '历史最悠久的马拉松，需抽签' },
    // 文化
    { title: '故宫夜场特展', tag: '文化', icon: '🏛️', heat: 76, date: '春季', loc: '故宫博物院',
      addr: '东城区景山前街4号', docs: '身份证/预约码', route: '地铁1号线天安门东站', tips: '必须提前7天在官网预约' },
    // 美食
    { title: '北京簋街美食节', tag: '美食', icon: '🦐', heat: 83, date: '6月', loc: '簋街',
      addr: '东城区东直门内大街', docs: '无', route: '地铁2号线东直门站', tips: '小龙虾一条街，晚上去氛围最好' },
    // 学习
    { title: '清华创业论坛', tag: '学习', icon: '🎓', heat: 78, date: '5月', loc: '清华大学',
      addr: '海淀区双清路30号', docs: '身份证', route: '地铁15号线清华东路西口站', tips: '提前在活动行报名' },
  ],
  '广州': [
    // 演唱会
    { title: '周杰伦「嘉年华」巡演广州站', tag: '演唱会', icon: '🎤', heat: 99, date: '4月26日', loc: '天河体育中心',
      addr: '天河区天河路299号', docs: '身份证/大麦电子票', route: '地铁1号线体育中心站', tips: '散场人多，建议走3号线方向' },
    { title: '张杰「未·LIVE」巡演广州站', tag: '演唱会', icon: '🎵', heat: 93, date: '5月17日', loc: '宝能观致文化中心',
      addr: '番禺区汉溪大道东680号', docs: '身份证/电子票', route: '地铁7号线板桥站', tips: '新场馆音响效果好' },
    { title: '广州爵士音乐节', tag: '演唱会', icon: '🎷', heat: 85, date: '11月', loc: '二沙岛',
      addr: '越秀区二沙岛大通路', docs: '电子票', route: '公交89路二沙岛西站', tips: '带野餐垫，草地上听更舒服' },
    { title: 'IU李知恩亚洲巡演广州站', tag: '演唱会', icon: '💜', heat: 91, date: '8月', loc: '天河体育中心',
      addr: '天河区天河路299号', docs: '身份证/护照/电子票', route: '地铁1号线体育中心站', tips: '韩团抢票关注大麦+猫眼双平台' },
    // 展会
    { title: '广交会', tag: '展会', icon: '🏢', heat: 95, date: '4月/10月', loc: '琶洲展馆',
      addr: '海珠区阅江中路380号', docs: '身份证/采购证', route: '地铁8号线琶洲站', tips: '提前在官网申请采购证' },
    // 科技
    { title: '小蛮腰科技大会', tag: '科技', icon: '🗼', heat: 85, date: '5月', loc: '广州塔',
      addr: '海珠区阅江西路222号', docs: '邀请函/报名码', route: '地铁3号线广州塔站', tips: '会后可登塔观光' },
    // 运动
    { title: '广州恒大主场', tag: '运动', icon: '⚽', heat: 88, date: '周末', loc: '天河体育场',
      addr: '天河区天河路299号', docs: '身份证/电子票', route: '地铁1号线体育中心站', tips: '提前在大麦网购票' },
    { title: '珠江夜跑团', tag: '运动', icon: '🏃', heat: 72, date: '每周', loc: '珠江边',
      addr: '海珠区滨江东路', docs: '无', route: '地铁2号线江南西站', tips: '每周三晚7:30集合，免费' },
    // 美食
    { title: '广州国际美食节', tag: '美食', icon: '🍲', heat: 90, date: '11月', loc: '番禺',
      addr: '番禺区雄峰城', docs: '无', route: '地铁3号线市桥站', tips: '广州人最爱的年度美食盛事' },
    { title: '早茶文化体验季', tag: '美食', icon: '🥟', heat: 82, date: '全年', loc: '荔湾区',
      addr: '荔湾区上下九步行街', docs: '无', route: '地铁1号线长寿路站', tips: '陶陶居/点都德必试' },
    // 学习
    { title: 'TEDx 广州', tag: '学习', icon: '💡', heat: 78, date: '6月', loc: '天河区',
      addr: '天河区珠江新城花城广场', docs: '报名确认邮件', route: '地铁3/5号线珠江新城站', tips: '中英文演讲都有' },
  ],
  '深圳': [
    // 演唱会
    { title: '薛之谦「天外来物」巡演深圳站', tag: '演唱会', icon: '🎤', heat: 96, date: '5月3日', loc: '深圳湾体育中心',
      addr: '南山区滨海大道3001号', docs: '身份证/大麦电子票', route: '地铁2/11号线后海站', tips: '春茧馆音效佳，内场值得' },
    { title: '华晨宇「火星演唱会」巡演', tag: '演唱会', icon: '🔥', heat: 93, date: '6月', loc: '深圳大运中心',
      addr: '龙岗区龙翔大道2188号', docs: '身份证/电子票', route: '地铁3号线大运站', tips: '场馆大，建议买前区' },
    { title: '深圳湾公园音乐会', tag: '演唱会', icon: '🎵', heat: 78, date: '周末', loc: '深圳湾',
      addr: '南山区望海路', docs: '无需门票', route: '地铁2号线登良站', tips: '傍晚去可以看日落+听歌' },
    { title: '迷笛音乐节深圳站', tag: '演唱会', icon: '🎸', heat: 88, date: '4月', loc: '南山区',
      addr: '南山区欢乐海岸', docs: '身份证/电子票', route: '地铁2号线侨城北站', tips: '摇滚乐迷必去，带耳塞保护听力' },
    // 科技
    { title: '腾讯全球数字生态大会', tag: '科技', icon: '🐧', heat: 96, date: '6月', loc: '深圳会展中心',
      addr: '福田区福华三路', docs: '邀请函/报名码', route: '地铁1/4号线会展中心站', tips: '关注腾讯云公众号' },
    { title: 'Maker Faire 深圳', tag: '科技', icon: '🔧', heat: 90, date: '10月', loc: '南山区',
      addr: '南山区南海大道3688号', docs: '身份证/门票', route: '地铁2号线南山站', tips: '适合带小孩' },
    // 展会
    { title: '华强北电子展', tag: '展会', icon: '📱', heat: 82, date: '全年', loc: '华强北',
      addr: '福田区华强北路', docs: '无', route: '地铁1号线华强路站', tips: '讲价是基本操作' },
    // 运动
    { title: '深圳南山半程马拉松', tag: '运动', icon: '🏃', heat: 85, date: '3月', loc: '南山区',
      addr: '南山区深圳湾体育中心', docs: '身份证/体检报告', route: '地铁2/11号线后海站', tips: '赛前领物需本人身份证' },
    // 美食
    { title: '深圳美食嘉年华', tag: '美食', icon: '🍜', heat: 84, date: '10月', loc: '福田中心区',
      addr: '福田区莲花山公园旁', docs: '无', route: '地铁3/4号线少年宫站', tips: '各国美食+本地小吃' },
    // 社交
    { title: '前海创投路演', tag: '社交', icon: '💰', heat: 75, date: '每月', loc: '前海',
      addr: '南山区前海深港合作区', docs: 'BP/名片', route: '地铁5号线前海湾站', tips: '创业项目可申请路演名额' },
  ],
  '杭州': [
    // 演唱会
    { title: '周杰伦「嘉年华」巡演杭州站', tag: '演唱会', icon: '🎤', heat: 99, date: '7月19日', loc: '黄龙体育中心',
      addr: '西湖区黄龙路1号', docs: '身份证/大麦电子票', route: '地铁2号线沈塘桥站', tips: '杭州场次抢手度仅次于上海站' },
    { title: '西湖音乐节', tag: '演唱会', icon: '🎵', heat: 90, date: '5月', loc: '太子湾',
      addr: '西湖区太子湾公园', docs: '电子票', route: '地铁1号线龙翔桥站步行20分钟', tips: '草地先到先得，带防晒' },
    { title: '毛不易「小王」巡演杭州站', tag: '演唱会', icon: '🎤', heat: 88, date: '6月', loc: '杭州奥体中心',
      addr: '萧山区飞虹路', docs: '身份证/电子票', route: '地铁6号线奥体站', tips: '新场馆交通方便' },
    { title: '赵雷民谣专场', tag: '演唱会', icon: '🎸', heat: 84, date: '4月', loc: '杭州大剧院',
      addr: '江干区新业路39号', docs: '身份证/电子票', route: '地铁4号线市民中心站', tips: '小场馆氛围棒，早买早选座' },
    // 科技
    { title: '云栖大会', tag: '科技', icon: '☁️', heat: 97, date: '9月', loc: '云栖小镇',
      addr: '西湖区转塘街道', docs: '身份证/报名码', route: '地铁6号线云栖站', tips: '阿里云官网报名，主论坛免费' },
    { title: 'GDG DevFest', tag: '科技', icon: '🧑‍💻', heat: 80, date: '11月', loc: '滨江区',
      addr: '滨江区网商路699号', docs: '报名二维码', route: '地铁1号线江陵路站', tips: 'Google开发者社区年度盛会' },
    // 展会
    { title: '中国国际动漫节', tag: '展会', icon: '🎌', heat: 82, date: '4月', loc: '白马湖',
      addr: '滨江区长河街道白马湖路', docs: '身份证/门票', route: '地铁6号线建业路站', tips: 'Cosplay爱好者天堂' },
    // 运动
    { title: '杭州马拉松', tag: '运动', icon: '🏃', heat: 88, date: '11月', loc: '西湖',
      addr: '西湖区北山街', docs: '身份证/体检报告', route: '地铁1号线龙翔桥站', tips: '沿西湖跑，风景绝美，需抽签' },
    // 文化
    { title: '宋城千古情', tag: '文化', icon: '🏯', heat: 75, date: '全年', loc: '宋城',
      addr: '西湖区之江路148号', docs: '身份证/门票', route: '公交4路/308路宋城站', tips: '下午场+晚场性价比高' },
    // 美食
    { title: '杭州亚洲美食节', tag: '美食', icon: '🍜', heat: 86, date: '5月', loc: '钱江新城',
      addr: '江干区钱江新城', docs: '无', route: '地铁4号线市民中心站', tips: '各国美食齐聚，龙虾扎啤不能错过' },
  ],
  '成都': [
    // 演唱会
    { title: '周杰伦「嘉年华」巡演成都站', tag: '演唱会', icon: '🎤', heat: 99, date: '8月9日', loc: '凤凰山体育公园',
      addr: '金牛区凤凰山', docs: '身份证/大麦电子票', route: '地铁5号线凤凰山公园站', tips: '新场馆设施一流，注意实名制' },
    { title: '草莓音乐节成都站', tag: '演唱会', icon: '🍓', heat: 92, date: '5月', loc: '蔚然花海',
      addr: '新津区花源街道', docs: '电子票', route: '地铁10号线新津站转公交', tips: '带折叠椅和防晒' },
    { title: '李荣浩「纵横四海」巡演成都站', tag: '演唱会', icon: '🎵', heat: 89, date: '6月', loc: '凤凰山体育公园',
      addr: '金牛区凤凰山', docs: '身份证/电子票', route: '地铁5号线凤凰山公园站', tips: '现场互动多，关注大麦上新' },
    { title: '成都仙人掌音乐节', tag: '演唱会', icon: '🌵', heat: 85, date: '10月', loc: '东郊记忆',
      addr: '成华区建设南支路4号', docs: '电子票', route: '地铁7号线东郊记忆站', tips: '独立音乐厂牌优秀' },
    // 展会
    { title: '成都国际车展', tag: '展会', icon: '🚗', heat: 88, date: '8月', loc: '西博城',
      addr: '天府新区福州路东段88号', docs: '身份证/门票', route: '地铁1/18号线西博城站', tips: '工作日人少' },
    { title: '春糖全国糖酒会', tag: '展会', icon: '🍷', heat: 85, date: '3月', loc: '西博城',
      addr: '天府新区福州路东段88号', docs: '身份证/参展证', route: '地铁1/18号线西博城站', tips: '可免费试吃试喝' },
    // 运动
    { title: '成都大运会系列活动', tag: '运动', icon: '🏅', heat: 92, date: '全年', loc: '东安湖',
      addr: '龙泉驿区东安湖体育公园', docs: '身份证/门票', route: '地铁2号线龙泉驿站', tips: '体育公园免费开放跑步' },
    // 美食
    { title: '成都火锅节', tag: '美食', icon: '🍲', heat: 94, date: '10月', loc: '锦里',
      addr: '武侯区锦里古街', docs: '无', route: '地铁3号线高升桥站', tips: '50+火锅品牌集中试吃' },
    { title: '成都串串香美食周', tag: '美食', icon: '🍢', heat: 86, date: '6月', loc: '春熙路',
      addr: '锦江区春熙路', docs: '无', route: '地铁2/3号线春熙路站', tips: '竹签消费，人均50-80很满足' },
    // 社交
    { title: '太古里创意市集', tag: '社交', icon: '🛍️', heat: 78, date: '周末', loc: '太古里',
      addr: '锦江区中纱帽街8号', docs: '无', route: '地铁2/3号线春熙路站', tips: '逛完打卡IFS熊猫' },
    // 学习
    { title: '成都读书会', tag: '学习', icon: '📖', heat: 70, date: '每周', loc: '方所书店',
      addr: '锦江区中纱帽街8号太古里B1', docs: '无', route: '地铁2/3号线春熙路站', tips: '每周六下午，微信群报名' },
  ],
  '_default': [
    // 演唱会
    { title: '周杰伦「嘉年华」世界巡回演唱会', tag: '演唱会', icon: '🎤', heat: 99, date: '2026全年', loc: '各城市',
      addr: '关注大麦网查询你所在城市场次', docs: '身份证/大麦电子票', route: '详见具体场馆', tips: '开售即抢！建议提前注册大麦实名' },
    { title: '薛之谦巡演', tag: '演唱会', icon: '🎵', heat: 95, date: '2026全年', loc: '全国巡演',
      addr: '关注大麦/猫眼查询', docs: '身份证/电子票', route: '详见场馆', tips: '人气火爆，提前抢票' },
    { title: '五月天巡演', tag: '演唱会', icon: '🎸', heat: 92, date: '2026', loc: '全国巡演',
      addr: '大麦网查询场次', docs: '身份证/电子票', route: '详见场馆', tips: '五迷做好合唱准备' },
    // 科技
    { title: 'Apple WWDC 2026 线上直播', tag: '科技', icon: '🍎', heat: 95, date: '6月', loc: '线上',
      addr: '线上直播', docs: '无', route: 'Apple官网/B站/YouTube', tips: '北京时间凌晨1点开始' },
    { title: 'Google I/O 2026', tag: '科技', icon: '🤖', heat: 93, date: '5月', loc: '线上',
      addr: '线上直播', docs: '无', route: 'Google开发者官网', tips: '有中文同传直播' },
    // 运动
    { title: '全民健身日', tag: '运动', icon: '🏃', heat: 85, date: '8月8日', loc: '全国',
      addr: '各城市体育场馆', docs: '身份证', route: '就近体育场馆', tips: '当天大量场馆免费开放' },
    { title: '社区公益跑', tag: '运动', icon: '👟', heat: 68, date: '周六', loc: '附近公园',
      addr: '附近公园', docs: '无', route: '步行/骑车', tips: '早上7:30集合，全程约5公里' },
    // 美食
    { title: '本地探店美食周', tag: '美食', icon: '🍽️', heat: 82, date: '每季度', loc: '本地',
      addr: '大众点评/小红书推荐', docs: '无', route: '按推荐导航', tips: '参考大众点评必吃榜' },
    // 文化
    { title: '本周热映电影TOP5', tag: '文化', icon: '🎬', heat: 80, date: '本周', loc: '附近影院',
      addr: '就近电影院', docs: '无', route: '猫眼/淘票票查场次', tips: '工作日半价' },
    // 购物
    { title: '双十一预售攻略', tag: '购物', icon: '🛒', heat: 90, date: '10月', loc: '线上',
      addr: '线上', docs: '无', route: '淘宝/京东/拼多多', tips: '提前加购物车，关注满减规则' },
    // 社交
    { title: '小红书热门打卡地', tag: '社交', icon: '📕', heat: 82, date: '实时', loc: '本地',
      addr: '根据推荐而定', docs: '无', route: '搜索小红书同城推荐', tips: '避开周末高峰' },
    // 学习
    { title: '周末读书会', tag: '学习', icon: '📚', heat: 72, date: '周末', loc: '本地书店',
      addr: '本地书店/图书馆', docs: '无', route: '搜索本地读书会', tips: '很多城市有免费公益读书会' },
  ],
};

function formatDate(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toLocalDate(d);
}

const app = createApp({
  setup() {
    // ─── i18n ───
    const t = I18N.t;
    const currentLang = ref(I18N.getLang());
    function setLang(code) { I18N.setLang(code); currentLang.value = code; }

    // ─── Onboarding / Profile ───
    const profile = ref(lsObj('lp_profile'));
    const showOnboarding = ref(!profile.value);
    const onboardStep = ref(1);  // 1=nickname, 2=avatar, 3=city, 4=age
    const obNickname = ref('');
    const obAvatar = ref('🐱');
    const obCity = ref('');
    const obAge = ref('');

    function onboardNext() {
      if (onboardStep.value === 1) {
        if (!obNickname.value.trim()) return;
        onboardStep.value = 2;
      } else if (onboardStep.value === 2) {
        onboardStep.value = 3;
      } else if (onboardStep.value === 3) {
        if (obCity.value) localStorage.setItem('lp_city', obCity.value);
        onboardStep.value = 4;
      } else {
        const p = {
          nickname: obNickname.value.trim(),
          avatar: obAvatar.value,
          age: obAge.value ? parseInt(obAge.value) : null,
        };
        localStorage.setItem('lp_profile', JSON.stringify(p));
        if (obCity.value) planCity.value = obCity.value;
        profile.value = p;
        showOnboarding.value = false;
      }
    }
    function onboardBack() {
      if (onboardStep.value > 1) onboardStep.value--;
    }

    const tab = ref('plan');
    const tabBar = ref(null);
    const tabIndicatorStyle = computed(() => {
      const tabs = ['plan', 'diary', 'review', 'insights'];
      const idx = tabs.indexOf(tab.value);
      const pct = 100 / tabs.length;
      return { left: (idx * pct) + '%', width: pct + '%' };
    });
    const aiProvider = ref(localStorage.getItem('lp_aiProvider') || 'deepseek');

    // ─── Theme Color Picker ───
    const themeColors = [
      { value: '#c59a5f', label: t('color.amber') },
      { value: '#7cb8ca', label: t('color.sky_blue') },
      { value: '#a494c4', label: t('color.lavender') },
      { value: '#e08888', label: t('color.rose') },
      { value: '#7aad8b', label: t('color.dark_green') },
      { value: '#5ab8c7', label: t('color.teal') },
      { value: '#c99aaa', label: t('color.peach') },
      { value: '#8a9ab0', label: t('color.graphite') },
    ];
    const bgThemes = [
      { value: 'coffee', label: t('bg.coffee'), emoji: '☕' },
      { value: 'cloud',  label: t('bg.cloud'), emoji: '☁️' },
      { value: 'sky',    label: t('bg.sky'), emoji: '🌌' },
      { value: 'forest', label: t('bg.forest'), emoji: '🌲' },
      { value: 'rose',   label: t('bg.rose'), emoji: '🌹' },
      { value: 'lavender', label: t('bg.lavender'), emoji: '💜' },
    ];
    const themeColor = ref(localStorage.getItem('lp_theme') || '#c59a5f');
    const bgTheme = ref(localStorage.getItem('lp_bg') || 'coffee');
    const showThemePicker = ref(false);
    function setTheme(color) {
      themeColor.value = color;
      localStorage.setItem('lp_theme', color);
      document.documentElement.style.setProperty('--indigo', color);
    }
    function setBgTheme(bg) {
      bgTheme.value = bg;
      localStorage.setItem('lp_bg', bg);
      document.documentElement.setAttribute('data-bg', bg === 'coffee' ? '' : bg);
    }
    // Apply saved theme on load
    onMounted(() => {
      const saved = localStorage.getItem('lp_theme');
      if (saved) document.documentElement.style.setProperty('--indigo', saved);
      const savedBg = localStorage.getItem('lp_bg');
      if (savedBg && savedBg !== 'coffee') document.documentElement.setAttribute('data-bg', savedBg);
      document.addEventListener('click', () => { showThemePicker.value = false; });
    });

    watch(aiProvider, v => localStorage.setItem('lp_aiProvider', v));

    // ─── Daily Quote + User Motto ───
    const DAILY_QUOTES = Array.from({length: 31}, (_, i) => ({ text: t('quote.' + i), author: t('quote.' + i + 'a') }));
    function getTodayQuote() {
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000);
      return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
    }
    const dailyQuote = ref(getTodayQuote());
    function refreshQuote() {
      let next;
      do { next = DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)]; } while (next.text === dailyQuote.value.text && DAILY_QUOTES.length > 1);
      dailyQuote.value = next;
    }
    const userMotto = ref(localStorage.getItem('lp_motto') || '');
    const editingMotto = ref(false);
    const mottoInput = ref('');
    function startEditMotto() { mottoInput.value = userMotto.value; editingMotto.value = true; }
    function saveMotto() {
      userMotto.value = mottoInput.value.trim();
      if (userMotto.value) { localStorage.setItem('lp_motto', userMotto.value); }
      else { localStorage.removeItem('lp_motto'); }
      editingMotto.value = false;
    }
    function deleteMotto() { userMotto.value = ''; localStorage.removeItem('lp_motto'); editingMotto.value = false; }

    // ─── Plan ───
    const planDate = ref(today());
    const planCity = ref(localStorage.getItem('lp_city') || t('default.city'));
    const plans = ref([]);
    const showPlanModal = ref(false);
    const editingPlan = ref(null);
    const planForm = ref(emptyPlanForm());

    function nowTime() {
      const d = new Date();
      return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    }
    function plusHours(t, h) {
      const [hh, mm] = t.split(':').map(Number);
      const nh = Math.min(hh + h, 23);
      return String(nh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');
    }

    // ─── Plan Emoji & Color ───
    const PLAN_EMOJIS = ['📝','☀️','📖','🍜','🏃','🎬','💼','🎯','🧘','🎨','🎵','✈️','🛒','💪','☕','🎮','📸','🌿','🐾','💡'];
    const PLAN_COLORS = [
      { name: t('color.none'), value: '' },
      { name: t('color.amber'), value: '#c59a5f' },
      { name: t('color.emerald'), value: '#5f8a6e' },
      { name: t('color.sky_blue'), value: '#6a9cad' },
      { name: t('color.rose'), value: '#c26e6e' },
      { name: t('color.wisteria'), value: '#8a7ba8' },
      { name: t('color.coral'), value: '#e08870' },
      { name: t('color.mint'), value: '#5fbda0' },
    ];

    function emptyPlanForm() {
      const nt = nowTime();
      return { date: today(), time_start: nt, time_end: plusHours(nt, 2), title: '', location: '', city: planCity.value, category: 'other', notes: '', emoji: '', color: '', widgets: [] };
    }
    // Widget types: 'pomodoro' | 'counter' | 'micronote'
    const PLAN_WIDGETS = [
      { key: 'pomodoro', icon: '🍅', label: t('widget.pomodoro'), desc: t('widget.pomodoro_desc') },
      { key: 'counter',  icon: '📊', label: t('widget.counter'), desc: t('widget.counter_desc') },
      { key: 'micronote',icon: '📝', label: t('widget.micronote'), desc: t('widget.micronote_desc') },
    ];

    // ─── Plan Templates ───
    const showTemplates = ref(false);
    const PLAN_TEMPLATES = [
      { id: 'morning', cover: '🌅', title: t('tpl.morning.title'), desc: t('tpl.morning.desc'), color: '#c59a5f', days: 21,
        tasks: [
          { time_start: '06:30', time_end: '06:45', title: t('tpl.morning.t1'), category: 'other', emoji: '☀️', widgets: ['counter'] },
          { time_start: '06:45', time_end: '07:00', title: t('tpl.morning.t2'), category: 'exercise', emoji: '🧘', widgets: ['pomodoro'] },
          { time_start: '07:00', time_end: '07:30', title: t('tpl.morning.t3'), category: 'food', emoji: '🍳' },
        ]},
      { id: 'fitness', cover: '💪', title: t('tpl.fitness.title'), desc: t('tpl.fitness.desc'), color: '#5f8a6e', days: 30,
        tasks: [
          { time_start: '07:00', time_end: '07:30', title: t('tpl.fitness.t1'), category: 'exercise', emoji: '🏃' },
          { time_start: '18:00', time_end: '19:00', title: t('tpl.fitness.t2'), category: 'exercise', emoji: '💪', widgets: ['pomodoro','counter'] },
          { time_start: '19:30', time_end: '20:00', title: t('tpl.fitness.t3'), category: 'food', emoji: '🥗', widgets: ['micronote'] },
        ]},
      { id: 'weekend', cover: '🌟', title: t('tpl.weekend.title'), desc: t('tpl.weekend.desc'), color: '#6a9cad', days: 2,
        tasks: [
          { time_start: '09:00', time_end: '10:00', title: t('tpl.weekend.t1'), category: 'food', emoji: '☕' },
          { time_start: '10:30', time_end: '12:00', title: t('tpl.weekend.t2'), category: 'work', emoji: '📖', widgets: ['pomodoro','micronote'] },
          { time_start: '14:00', time_end: '17:00', title: t('tpl.weekend.t3'), category: 'travel', emoji: '🌿' },
          { time_start: '19:00', time_end: '21:00', title: t('tpl.weekend.t4'), category: 'other', emoji: '🎬' },
        ]},
      { id: 'reading', cover: '📚', title: t('tpl.reading.title'), desc: t('tpl.reading.desc'), color: '#8a7ba8', days: 30,
        tasks: [
          { time_start: '08:00', time_end: '09:00', title: t('tpl.reading.t1'), category: 'work', emoji: '📖', widgets: ['pomodoro','counter'] },
          { time_start: '21:00', time_end: '21:30', title: t('tpl.reading.t2'), category: 'work', emoji: '✍️', widgets: ['micronote'] },
        ]},
      { id: 'nosleep', cover: '🌙', title: t('tpl.nosleep.title'), desc: t('tpl.nosleep.desc'), color: '#e08870', days: 30,
        tasks: [
          { time_start: '21:30', time_end: '22:00', title: t('tpl.nosleep.t1'), category: 'other', emoji: '📵' },
          { time_start: '22:00', time_end: '22:20', title: t('tpl.nosleep.t2'), category: 'exercise', emoji: '🧘', widgets: ['pomodoro'] },
          { time_start: '22:30', time_end: '06:30', title: t('tpl.nosleep.t3'), category: 'other', emoji: '😴' },
        ]},
    ];

    function applyTemplate(tpl) {
      const all = lsLoad('lp_plans');
      const startDate = new Date();
      for (let day = 0; day < Math.min(tpl.days, 7); day++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + day);
        const dateStr = toLocalDate(d);
        for (const task of tpl.tasks) {
          all.push({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2,6) + day + all.length,
            date: dateStr,
            time_start: task.time_start,
            time_end: task.time_end,
            title: task.title,
            location: '',
            city: planCity.value,
            category: task.category,
            notes: '',
            emoji: task.emoji || '',
            color: tpl.color || '',
            widgets: task.widgets || [],
            done: false,
          });
        }
      }
      lsSave('lp_plans', all);
      plans.value = all;
      showTemplates.value = false;
      addXP(10);
    }

    // ─── Floating Weekly Tasks ───
    const floatingTasks = ref(lsLoad('lp_floats'));
    const showFloatModal = ref(false);
    const floatForm = ref({ title: '', target: 3, emoji: '🎯' });
    const FLOAT_EMOJIS = ['🎯','💪','📖','🏃','🧘','🌿','☕','🍎'];

    function saveFloat() {
      if (!floatForm.value.title) return;
      const all = lsLoad('lp_floats');
      all.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
        title: floatForm.value.title,
        emoji: floatForm.value.emoji,
        target: floatForm.value.target || 3,
        done: 0,
        weekStart: getWeekStart(),
      });
      lsSave('lp_floats', all);
      floatingTasks.value = all;
      showFloatModal.value = false;
      floatForm.value = { title: '', target: 3, emoji: '🎯' };
    }

    function bumpFloat(id) {
      const all = lsLoad('lp_floats');
      const f = all.find(x => x.id === id);
      if (f && f.done < f.target) { f.done++; lsSave('lp_floats', all); floatingTasks.value = all; if (f.done >= f.target) addXP(8); }
    }

    function deleteFloat(id) {
      const all = lsLoad('lp_floats').filter(x => x.id !== id);
      lsSave('lp_floats', all);
      floatingTasks.value = all;
    }

    function getWeekStart() {
      const d = new Date(); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return toLocalDate(new Date(d.setDate(diff)));
    }

    const activeFloats = computed(() => {
      const ws = getWeekStart();
      return floatingTasks.value.filter(f => f.weekStart === ws);
    });

    // ─── Quick Action Cards ───
    const QUICK_ACTIONS = [
      { emoji: '📈', title: t('qa.invest'), cat: 'work', subs: ['market_review','stock_research','adjust_position','learn_finance','dca_fund','trade_notes','read_reports','sim_trade'].map(k => t('sub.' + k)) },
      { emoji: '🏃', title: t('act.running'), cat: 'exercise', subs: ['morning_3k','night_5k','park_jog','interval','treadmill','marathon_train','post_run_stretch','run_checkin'].map(k => t('sub.' + k)) },
      { emoji: '💪', title: t('act.gym'), cat: 'exercise', subs: ['chest','back','legs','core','arms','hiit','stretch','cardio'].map(k => t('sub.' + k)) },
      { emoji: '📚', title: t('qa.study'), cat: 'work', subs: ['read_1h','vocab','problems','watch_course','take_notes','practice_code','cert_study','podcast'].map(k => t('sub.' + k)) },
      { emoji: '🍜', title: t('qa.eat_out'), cat: 'food', subs: ['qa_hotpot','qa_bbq','qa_japanese','qa_southeast_asian','qa_western','qa_sichuan','qa_cantonese','qa_korean','qa_buffet','qa_crayfish','qa_afternoon_tea','qa_late_night'].map(k => t('sub.' + k)) },
      { emoji: '☕', title: t('act.drink_coffee'), cat: 'food', subs: ['americano','latte','pour_over','coffee_explore','coffee_read','coffee_work','coffee_meet','try_new'].map(k => t('sub.' + k)) },
      { emoji: '🎬', title: t('act.watch_movie'), cat: 'other', subs: ['new_release','classic','documentary','animation','marvel_dc','arthouse','horror','comedy','couple_movie','friends_movie'].map(k => t('sub.' + k)) },
      { emoji: '🧘', title: t('qa.yoga_meditation'), cat: 'exercise', subs: ['am_meditation','pm_meditation','yoga_30','stretch_yoga','flow_yoga','yin_yoga','breathing','mindfulness'].map(k => t('sub.' + k)) },
    ];
    const quickActionSubs = ref(null); // current sub-activities from quick action

    // Map activity names to sub-activities for drill-down
    const _SUBS_RAW = {
      eat_hotpot: ['chongqing_hotpot','chaoshan_beef','copper_pot','coconut_chicken','tomato_pot','mushroom_pot','buffet_hotpot','haidilao'],
      eat_bbq: ['northeast_bbq','yakitori','korean_bbq','food_stall_bbq','buffet_bbq','outdoor_bbq'],
      eat_japanese: ['sushi','ramen','izakaya','sashimi','tempura','grilled_eel','yakiniku','omakase'],
      eat_western: ['pasta','steak','french','pizza','burger','brunch','spanish','mexican'],
      eat_sichuan: ['boiled_fish','mala_pot','chuanchuan','maocai','boboji','couple_slices','twice_cooked_pork'],
      eat_cantonese: ['morning_tea','roast_meats','claypot_rice','white_cut_chicken','rice_noodle_rolls','shrimp_dumpling','char_siu'],
      afternoon_tea: ['british_tea','dessert_shop','cake','milktea','ice_cream','explore_shop'],
      watch_movie: ['new_release','classic','documentary','animation','marvel_dc','arthouse','horror','comedy'],
      visit_exhibition: ['art_show','photo_show','contemporary','tech_show','design_show','immersive','gallery'],
      running: ['morning_3k','night_5k','park_jog','interval','treadmill','marathon_train'],
      gym: ['chest','back','legs','core','hiit','stretch','cardio'],
      swimming: ['freestyle','breaststroke','backstroke','butterfly','aqua_fit','swim_checkin'],
      hiking: ['suburban','greenway','trail','night_hike','weekend_hike'],
      stroll_park: ['park_walk','park_picnic','park_kite','park_photo','sunbathe','see_flowers'],
      camping: ['tent','rooftop','bbq_camp','stargazing','lakeside'],
      drink_coffee: ['americano','latte','pour_over','coffee_explore','coffee_read','coffee_work'],
      friends_dinner: ['hotpot_party','bbq_party','ktv','board_games','script_play','escape_play','party'],
    };
    const ACTIVITY_SUBS = {};
    for (const [k, subs] of Object.entries(_SUBS_RAW)) {
      ACTIVITY_SUBS[tAct(k)] = subs.map(s => t('sub.' + s));
    }

    function quickAdd(action) {
      planForm.value = { ...emptyPlanForm(), date: planDate.value, city: planCity.value, title: '', category: action.cat };
      activityQuery.value = '';
      quickActionSubs.value = { emoji: action.emoji, title: action.title, items: action.subs };
      editingPlan.value = null;
      showPlanModal.value = true;
    }

    // ─── Activity search ───
    const activityQuery = ref('');
    const activityTab = ref(0); // index into ACTIVITY_GROUPS
    const showActivityDropdown = ref(false);
    const filteredActivities = computed(() => {
      const q = activityQuery.value.trim();
      if (!q) return ACTIVITIES;
      return ACTIVITIES.filter(a => a.includes(q));
    });
    function selectActivity(a) {
      // If this activity has sub-activities, show drill-down
      if (ACTIVITY_SUBS[a] && !quickActionSubs.value) {
        quickActionSubs.value = { emoji: '', title: a, items: ACTIVITY_SUBS[a] };
        planForm.value.category = _actCatByName[a] || 'other';
        return;
      }
      planForm.value.title = a;
      activityQuery.value = a;
      showActivityDropdown.value = false;
      planForm.value.category = _actCatByName[a] || 'other';
    }

    // ─── Address autocomplete ───
    const addressQuery = ref('');
    const showAddressDropdown = ref(false);
    const addressSuggestions = ref([]);
    const addressLoading = ref(false);

    function onAddressInput() {
      const val = addressQuery.value;
      planForm.value.location = val;
      if (!val || val.length < 1) { addressSuggestions.value = []; showAddressDropdown.value = false; return; }
      const city = planForm.value.city || t('default.city');
      const landmarks = getCityLandmarks(city);
      const matches = landmarks.filter(l => l.includes(val));
      addressSuggestions.value = matches.slice(0, 8);
      showAddressDropdown.value = matches.length > 0;
    }
    function selectAddress(addr) {
      planForm.value.location = addr;
      addressQuery.value = addr;
      showAddressDropdown.value = false;
    }

    watch(planCity, v => localStorage.setItem('lp_city', v));

    const filteredPlans = computed(() => {
      const sorted = plans.value
        .filter(p => p.date === planDate.value)
        .sort((a, b) => (a.time_start || '').localeCompare(b.time_start || ''));
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].location && sorted[i + 1].location) {
          sorted[i]._nextLocation = sorted[i + 1].location;
        }
      }
      return sorted;
    });

    const next7Days = computed(() => {
      const labels = [t('date.today'), t('date.tomorrow'), t('date.after')];
      const weekDays = [t('week.sun'),t('week.mon'),t('week.tue'),t('week.wed'),t('week.thu'),t('week.fri'),t('week.sat')];
      const res = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        res.push({
          date: toLocalDate(d),
          day: d.getDate(),
          label: i < 3 ? labels[i] : weekDays[d.getDay()],
        });
      }
      return res;
    });

    async function loadPlans() {
      let all = lsLoad('lp_plans');
      // Seed example plans for first-time users
      if (!all.length && !localStorage.getItem('lp_seeded')) {
        const td = today();
        const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return toLocalDate(d); })();
        all = [
          { id: 'demo_1', date: td, time_start: '07:30', time_end: '08:00', title: t('demo.1.title'), location: '', city: '', category: 'health', notes: t('demo.1.notes'), done: false },
          { id: 'demo_2', date: td, time_start: '09:00', time_end: '11:30', title: t('demo.2.title'), location: t('demo.2.location'), city: '', category: 'study', notes: t('demo.2.notes'), done: false },
          { id: 'demo_3', date: td, time_start: '12:00', time_end: '13:00', title: t('demo.3.title'), location: t('demo.3.location'), city: '', category: 'food', notes: t('demo.3.notes'), done: false },
          { id: 'demo_4', date: td, time_start: '18:00', time_end: '19:00', title: t('demo.4.title'), location: t('demo.4.location'), city: '', category: 'exercise', notes: t('demo.4.notes'), done: false },
          { id: 'demo_5', date: tomorrow, time_start: '14:00', time_end: '16:00', title: t('demo.5.title'), location: t('demo.5.location'), city: '', category: 'entertainment', notes: t('demo.5.notes'), done: false },
        ];
        lsSave('lp_plans', all);
        localStorage.setItem('lp_seeded', '1');
      }
      plans.value = all;
    }

    async function savePlan() {
      const f = planForm.value;
      if (!f.title) return alert(t('msg.no_title'));
      planCity.value = f.city || planCity.value;
      const all = lsLoad('lp_plans');
      if (editingPlan.value) {
        const idx = all.findIndex(p => p.id === editingPlan.value);
        if (idx >= 0) all[idx] = { ...f, id: editingPlan.value };
      } else {
        f.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        all.push(f);
        addXP(3);
      }
      lsSave('lp_plans', all);
      showPlanModal.value = false;
      editingPlan.value = null;
      activityQuery.value = '';
      addressQuery.value = '';
      planForm.value = emptyPlanForm();
      await loadPlans();
    }

    function editPlan(p) {
      editingPlan.value = p.id;
      planForm.value = { ...p };
      activityQuery.value = p.title;
      addressQuery.value = p.location || '';
      showPlanModal.value = true;
    }

    async function deletePlan(id) {
      if (!confirm(t('msg.del_plan'))) return;
      const all = lsLoad('lp_plans').filter(p => p.id !== id);
      lsSave('lp_plans', all);
      await loadPlans();
    }

    function skipPlan(id) {
      const all = lsLoad('lp_plans');
      const p = all.find(x => x.id === id);
      if (p) { p.skipped = !p.skipped; if (p.skipped) p.done = false; lsSave('lp_plans', all); plans.value = all; }
    }

    function toggleWidget(key) {
      const w = planForm.value.widgets || [];
      const idx = w.indexOf(key);
      if (idx >= 0) w.splice(idx, 1); else w.push(key);
      planForm.value.widgets = [...w];
    }

    function bumpCounter(id) {
      const all = lsLoad('lp_plans');
      const p = all.find(x => x.id === id);
      if (p) { p.counterVal = (p.counterVal || 0) + 1; lsSave('lp_plans', all); plans.value = all; }
    }

    function saveMicronote(id, text) {
      const all = lsLoad('lp_plans');
      const p = all.find(x => x.id === id);
      if (p) { p.micronote = text; lsSave('lp_plans', all); plans.value = all; }
    }

    function startPlanPomodoro(p) {
      showPomodoro.value = true;
    }

    // ─── Complete / Reward ───
    function spawnConfetti(evt) {
      const rect = evt.target.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const colors = ['#5f8a6e','#c59a5f','#c26e6e','#6a9cad','#8a7ba8','#e5c07b','#5f7d6e'];
      const container = document.createElement('div');
      container.className = 'confetti-container';
      document.body.appendChild(container);
      for (let i = 0; i < 24; i++) {
        const el = document.createElement('div');
        el.className = 'confetti';
        el.style.left = cx + 'px';
        el.style.top = cy + 'px';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.setProperty('--dx', (Math.random() - 0.5) * 200 + 'px');
        el.style.setProperty('--dy', -(80 + Math.random() * 200) + 'px');
        el.style.setProperty('--rot', (Math.random() * 1080 - 540) + 'deg');
        el.style.setProperty('--dur', (0.6 + Math.random() * 0.6) + 's');
        el.style.setProperty('--delay', (Math.random() * 0.15) + 's');
        el.style.width = (4 + Math.random() * 6) + 'px';
        el.style.height = (4 + Math.random() * 6) + 'px';
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        container.appendChild(el);
      }
      setTimeout(() => container.remove(), 1400);
    }

    function toggleDone(id, evt) {
      const all = lsLoad('lp_plans');
      const p = all.find(x => x.id === id);
      if (p) {
        const wasDone = p.done;
        p.done = !p.done;
        lsSave('lp_plans', all);
        plans.value = all;
        if (!wasDone && p.done) {
          // just completed → confetti + highlight + XP
          addXP(5);
          if (evt) spawnConfetti(evt);
          nextTick(() => {
            const el = document.querySelector(`[data-plan-id="${id}"]`);
            if (el) {
              el.classList.add('just-done');
              setTimeout(() => el.classList.remove('just-done'), 600);
            }
          });
        }
      }
    }
    const dayReward = computed(() => {
      const dayPlans = plans.value.filter(p => p.date === planDate.value);
      const total = dayPlans.length;
      const done = dayPlans.filter(p => p.done).length;
      const skipped = dayPlans.filter(p => p.skipped).length;
      const active = total - skipped;
      const stars = done >= 5 ? 3 : done >= 3 ? 2 : done >= 1 ? 1 : 0;
      const titles = [t('reward.0'), t('reward.1'), t('reward.2'), t('reward.3')];
      return { total: active, done, stars, title: titles[stars] };
    });

    // ─── Share ───
    async function sharePlan(p) {
      const text = `📌 ${p.date} ${p.time_start}-${p.time_end}\n${p.title}${p.location ? ' @ ' + p.location : ''}${p.city ? ' · ' + p.city : ''}\n\n— ${t('app.title')}`;
      if (navigator.share) {
        try {
          await navigator.share({ title: t('app.title'), text });
        } catch(e) {}
      } else {
        try {
          await navigator.clipboard.writeText(text);
          alert(t('msg.copied'));
        } catch(e) {
          prompt(t('msg.copy_prompt'), text);
        }
      }
    }

    // ─── Diary ───
    const diaryEntries = ref([]);
    const showDiaryModal = ref(false);
    const editingDiary = ref(null);
    const diaryForm = ref(emptyDiaryForm());

    function emptyDiaryForm() {
      return { date: today(), mood: 'good', tags: [], content: '' };
    }

    async function loadDiary() {
      const all = lsLoad('lp_diary');
      diaryEntries.value = all.sort((a, b) => b.date.localeCompare(a.date));
    }

    async function saveDiary() {
      const f = diaryForm.value;
      if (!f.content) return alert(t('msg.no_content'));
      const all = lsLoad('lp_diary');
      if (editingDiary.value) {
        const idx = all.findIndex(e => e.id === editingDiary.value);
        if (idx >= 0) all[idx] = { ...f, id: editingDiary.value };
      } else {
        f.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        all.push(f);
        addXP(8);
      }
      lsSave('lp_diary', all);
      showDiaryModal.value = false;
      editingDiary.value = null;
      diaryForm.value = emptyDiaryForm();
      await loadDiary();
    }

    function editDiary(e) {
      editingDiary.value = e.id;
      diaryForm.value = { date: e.date, mood: e.mood, tags: [...(e.tags||[])], content: e.content };
      showDiaryModal.value = true;
    }

    async function deleteDiary(id) {
      if (!confirm(t('msg.del_diary'))) return;
      const all = lsLoad('lp_diary').filter(e => e.id !== id);
      lsSave('lp_diary', all);
      await loadDiary();
    }

    function toggleTag(t) {
      const idx = diaryForm.value.tags.indexOf(t);
      if (idx >= 0) diaryForm.value.tags.splice(idx, 1);
      else diaryForm.value.tags.push(t);
    }

    function moodEmoji(key) {
      return MOODS.find(m => m.key === key)?.emoji || '😐';
    }

    // ─── Calendar / Review ───
    const calYear = ref(new Date().getFullYear());
    const calMonth = ref(new Date().getMonth());
    const reviewDate = ref('');
    const reviewDayPlans = ref([]);
    const reviewDayDiary = ref([]);

    const calDays = computed(() => {
      const first = new Date(calYear.value, calMonth.value, 1);
      const startDay = first.getDay();
      const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate();
      const prevDays = new Date(calYear.value, calMonth.value, 0).getDate();
      const todayStr = today();
      const planDates = new Set(plans.value.map(p => p.date));
      const diaryDates = new Set(diaryEntries.value.map(e => e.date));
      const days = [];

      for (let i = startDay - 1; i >= 0; i--) {
        const num = prevDays - i;
        const d = new Date(calYear.value, calMonth.value - 1, num);
        const ds = toLocalDate(d);
        days.push({ num, date: ds, otherMonth: true, isToday: false, hasPlan: planDates.has(ds), hasDiary: diaryDates.has(ds) });
      }
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(calYear.value, calMonth.value, i);
        const ds = toLocalDate(d);
        days.push({ num: i, date: ds, otherMonth: false, isToday: ds === todayStr, hasPlan: planDates.has(ds), hasDiary: diaryDates.has(ds) });
      }
      const remaining = 42 - days.length;
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(calYear.value, calMonth.value + 1, i);
        const ds = toLocalDate(d);
        days.push({ num: i, date: ds, otherMonth: true, isToday: false, hasPlan: planDates.has(ds), hasDiary: diaryDates.has(ds) });
      }
      return days;
    });

    function calPrev() {
      if (calMonth.value === 0) { calMonth.value = 11; calYear.value--; }
      else calMonth.value--;
    }
    function calNext() {
      if (calMonth.value === 11) { calMonth.value = 0; calYear.value++; }
      else calMonth.value++;
    }

    function loadReviewDay() {
      reviewDayPlans.value = plans.value.filter(p => p.date === reviewDate.value);
      reviewDayDiary.value = diaryEntries.value.filter(e => e.date === reviewDate.value);
    }

    // ─── AI ───
    const aiPlanResult = ref('');
    const aiPlanLoading = ref(false);
    const aiTransportResult = ref('');
    const aiTransportLoading = ref(false);
    const aiReviewResult = ref('');
    const aiReviewLoading = ref(false);

    async function aiPost(url, body) {
      // AI features disabled in static mode
      return { error: t('msg.ai_unavailable') };
    }

    async function getHotActivities() {
      aiPlanResult.value = t('msg.ai_plan_unavailable');
    }

    async function getSuggestPlaces(cat) {
      aiPlanResult.value = t('msg.ai_unavailable');
    }

    async function getTransport(from, to) {
      aiTransportResult.value = t('msg.ai_unavailable');
    }

    async function getLifeReview(period) {
      aiReviewResult.value = t('msg.ai_unavailable');
    }

    // ─── XP & Level System ───
    const XP_TABLE = [0,30,80,150,250,400,600,850,1200,1600,2100,2700,3400,4200,5200,6400,7800,9500,11500,14000];
    const LEVEL_TITLES = [t('level.0'),t('level.1'),t('level.2'),t('level.3'),t('level.4'),t('level.5'),t('level.6'),t('level.7'),t('level.8'),t('level.9')];
    const totalXP = ref(parseInt(localStorage.getItem('lp_xp') || '0'));
    const userLevel = computed(() => { let l = 1; for (let i = XP_TABLE.length - 1; i >= 0; i--) { if (totalXP.value >= XP_TABLE[i]) { l = i + 1; break; } } return Math.min(l, XP_TABLE.length); });
    const levelTitle = computed(() => LEVEL_TITLES[Math.min(Math.floor((userLevel.value-1)/2), LEVEL_TITLES.length-1)]);
    const nextLevelXP = computed(() => XP_TABLE[Math.min(userLevel.value, XP_TABLE.length-1)] || XP_TABLE[XP_TABLE.length-1]);
    const xpProgress = computed(() => { const prev = XP_TABLE[userLevel.value-1] || 0; const next = nextLevelXP.value; return next > prev ? ((totalXP.value - prev) / (next - prev) * 100) : 100; });
    function addXP(amount) { totalXP.value += amount; localStorage.setItem('lp_xp', String(totalXP.value)); }

    // ─── Stats Overview ───
    const statsOverview = computed(() => {
      const allP = plans.value;
      const totalPlans = allP.length;
      const completedPlans = allP.filter(p => p.done).length;
      const diaryCount = diaryEntries.value.length;
      // Streak: consecutive days with at least 1 completed plan (ending today or yesterday)
      let streak = 0;
      const doneByDate = {};
      allP.filter(p => p.done).forEach(p => { doneByDate[p.date] = true; });
      const d = new Date(); d.setHours(0,0,0,0);
      // check from today backwards
      if (!doneByDate[toLocalDate(d)]) d.setDate(d.getDate() - 1); // allow gap of today if not yet done
      while (doneByDate[toLocalDate(d)]) { streak++; d.setDate(d.getDate() - 1); }
      return { totalPlans, completedPlans, diaryCount, streak };
    });

    // ─── Mood Trend Chart ───
    const moodCanvas = ref(null);
    const MOOD_VALUES = { great: 5, love: 5, calm: 4, ok: 3, sad: 2, angry: 1, anxious: 0 };
    function drawMoodChart() {
      const canvas = moodCanvas.value; if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      // Gather last 30 days mood data
      const days = []; const d = new Date();
      for (let i = 29; i >= 0; i--) { const dd = new Date(d); dd.setDate(dd.getDate() - i); days.push(toLocalDate(dd)); }
      const pts = days.map(day => {
        const entries = diaryEntries.value.filter(e => e.date === day);
        if (!entries.length) return null;
        return entries.reduce((s, e) => s + (MOOD_VALUES[e.mood] ?? 3), 0) / entries.length;
      });
      const pad = { l: 30, r: 10, t: 15, b: 25 };
      const chartW = W - pad.l - pad.r, chartH = H - pad.t - pad.b;
      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) { const y = pad.t + chartH - (i / 5) * chartH; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); }
      // Plot line
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--indigo').trim() || '#c59a5f'; ctx.lineWidth = 2.5;
      ctx.beginPath(); let started = false;
      pts.forEach((v, i) => {
        if (v === null) { started = false; return; }
        const x = pad.l + (i / 29) * chartW; const y = pad.t + chartH - (v / 5) * chartH;
        if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
      });
      ctx.stroke();
      // Dots
      pts.forEach((v, i) => {
        if (v === null) return;
        const x = pad.l + (i / 29) * chartW; const y = pad.t + chartH - (v / 5) * chartH;
        ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
      });
      // Labels
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '18px sans-serif'; ctx.textAlign = 'center';
      [0, 9, 19, 29].forEach(i => {
        const x = pad.l + (i / 29) * chartW;
        ctx.fillText(days[i].slice(5), x, H - 4);
      });
    }

    // ─── Habit Heatmap ───
    const heatmapDays = computed(() => {
      const days = []; const d = new Date();
      const doneByDate = {};
      plans.value.filter(p => p.done).forEach(p => { doneByDate[p.date] = (doneByDate[p.date] || 0) + 1; });
      // pad to start on Sunday
      const end = new Date(d); end.setHours(0,0,0,0);
      const start = new Date(end); start.setDate(start.getDate() - 90);
      // align start to Sunday
      start.setDate(start.getDate() - start.getDay());
      for (let cur = new Date(start); cur <= end; cur.setDate(cur.getDate() + 1)) {
        const ds = toLocalDate(cur);
        const count = doneByDate[ds] || 0;
        const level = count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4;
        days.push({ date: ds, count, level });
      }
      return days;
    });
    const heatmapMonths = computed(() => {
      const days = heatmapDays.value; if (!days.length) return [];
      const months = []; let lastM = '';
      days.forEach((d, i) => {
        const m = d.date.slice(0, 7);
        if (m !== lastM) { months.push({ label: parseInt(d.date.slice(5, 7)) + t('unit.month'), offset: (i / days.length) * 100 }); lastM = m; }
      });
      return months;
    });

    // ─── 24h Time Pie Chart ───
    const pieCanvas = ref(null);
    const pieDateOffset = ref(0);
    const pieDate = computed(() => { const d = new Date(); d.setDate(d.getDate() + pieDateOffset.value); return toLocalDate(d); });
    const pieDateLabel = computed(() => { if (pieDateOffset.value === 0) return t('date.today'); if (pieDateOffset.value === -1) return t('date.yesterday'); return pieDate.value; });
    const PIE_COLORS = ['#c59a5f','#7cb8ca','#a494c4','#e08888','#7aad8b','#5ab8c7','#c99aaa','#8a9ab0','#f0c674','#66bb6a'];
    const pieSlices = computed(() => {
      const dayPlans = plans.value.filter(p => p.date === pieDate.value && p.time_start && p.time_end);
      if (!dayPlans.length) return [];
      const cats = {};
      dayPlans.forEach(p => {
        const [sh, sm] = p.time_start.split(':').map(Number);
        const [eh, em] = p.time_end.split(':').map(Number);
        const hours = Math.max(0, ((eh * 60 + em) - (sh * 60 + sm)) / 60);
        const cat = p.category || p.title || t('cat.other');
        cats[cat] = (cats[cat] || 0) + hours;
      });
      const entries = Object.entries(cats).sort((a, b) => b[1] - a[1]);
      return entries.map(([label, hours], i) => ({ label, hours: Math.round(hours * 10) / 10, color: PIE_COLORS[i % PIE_COLORS.length] }));
    });
    function drawPieChart() {
      const canvas = pieCanvas.value; if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2 - 10;
      ctx.clearRect(0, 0, W, H);
      const slices = pieSlices.value;
      if (!slices.length) return;
      const total = slices.reduce((s, sl) => s + sl.hours, 0);
      let angle = -Math.PI / 2;
      slices.forEach(sl => {
        const sweep = (sl.hours / total) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, angle, angle + sweep); ctx.closePath();
        ctx.fillStyle = sl.color; ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();
        angle += sweep;
      });
      // Inner hole for donut
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2); ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#1a1a2e'; ctx.fill();
    }

    // ─── Monthly Report ───
    const reportMonth = computed(() => new Date().getMonth() + 1);
    const monthReport = computed(() => {
      const m = new Date().getMonth(); const y = new Date().getFullYear();
      const prefix = `${y}/${String(m + 1).padStart(2, '0')}`;
      const mPlans = plans.value.filter(p => p.date && p.date.startsWith(prefix));
      const total = mPlans.length;
      const completed = mPlans.filter(p => p.done).length;
      const mDiary = diaryEntries.value.filter(e => e.date && e.date.startsWith(prefix));
      const diaryCount = mDiary.length;
      // Top category
      const catCount = {};
      mPlans.forEach(p => { const c = p.category || t('cat.other'); catCount[c] = (catCount[c] || 0) + 1; });
      const topCategory = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      // Top mood
      const moodCount = {};
      mDiary.forEach(e => { if (e.mood) moodCount[e.mood] = (moodCount[e.mood] || 0) + 1; });
      const topMoodKey = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      const topMood = topMoodKey ? (MOODS.find(mm => mm.key === topMoodKey)?.emoji || '') : '';
      // Insight
      let insight = '';
      if (total > 0) {
        const rate = Math.round(completed / total * 100);
        if (rate >= 80) insight = t('insight.great', rate);
        else if (rate >= 50) insight = t('insight.good', rate);
        else insight = t('insight.low', rate);
      }
      if (diaryCount >= 20) insight += ' '+t('insight.diary_good');
      return { total, completed, diaryCount, topCategory, topMood, insight };
    });

    // ─── Achievement Badges ───
    const BADGE_DEFS = [
      { id: 'early_bird', name: t('badge.early_bird'), icon: '🐦', desc: t('badge.early_bird_desc'), check: () => { let streak = 0, maxS = 0; const d = new Date(); for (let i = 0; i < 30; i++) { const ds = toLocalDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() - i)); const early = plans.value.some(p => p.date === ds && p.time_start && p.time_start < '08:00'); if (early) { streak++; maxS = Math.max(maxS, streak); } else streak = 0; } return maxS >= 3; }},
      { id: 'assassin', name: t('badge.assassin'), icon: '⚡', desc: t('badge.assassin_desc'), check: () => { const byDate = {}; plans.value.filter(p => p.done).forEach(p => { byDate[p.date] = (byDate[p.date] || 0) + 1; }); return Object.values(byDate).some(c => c > 5); }},
      { id: 'writer', name: t('badge.writer'), icon: '✍️', desc: t('badge.writer_desc'), check: () => diaryEntries.value.reduce((s, e) => s + (e.content?.length || 0), 0) >= 5000 },
      { id: 'streak3', name: t('badge.streak3'), icon: '🔥', desc: t('badge.streak3_desc'), check: () => statsOverview.value.streak >= 3 },
      { id: 'streak7', name: t('badge.streak7'), icon: '💎', desc: t('badge.streak7_desc'), check: () => statsOverview.value.streak >= 7 },
      { id: 'streak30', name: t('badge.streak30'), icon: '🌟', desc: t('badge.streak30_desc'), check: () => statsOverview.value.streak >= 30 },
      { id: 'planner50', name: t('badge.planner50'), icon: '📋', desc: t('badge.planner50_desc'), check: () => plans.value.length >= 50 },
      { id: 'planner200', name: t('badge.planner200'), icon: '🏆', desc: t('badge.planner200_desc'), check: () => plans.value.length >= 200 },
      { id: 'diary10', name: t('badge.diary10'), icon: '📖', desc: t('badge.diary10_desc'), check: () => diaryEntries.value.length >= 10 },
      { id: 'diary50', name: t('badge.diary50'), icon: '📚', desc: t('badge.diary50_desc'), check: () => diaryEntries.value.length >= 50 },
      { id: 'mood_happy', name: t('badge.mood_happy'), icon: '😄', desc: t('badge.mood_happy_desc'), check: () => diaryEntries.value.filter(e => e.mood === 'great').length >= 10 },
      { id: 'focus_first', name: t('badge.focus_first'), icon: '🌱', desc: t('badge.focus_first_desc'), check: () => focusHistory.value.length >= 1 },
      { id: 'focus10', name: t('badge.focus10'), icon: '🌳', desc: t('badge.focus10_desc'), check: () => focusHistory.value.length >= 10 },
      { id: 'capsule', name: t('badge.capsule'), icon: '💌', desc: t('badge.capsule_desc'), check: () => capsules.value.length >= 1 },
      { id: 'explorer', name: t('badge.explorer'), icon: '🗺️', desc: t('badge.explorer_desc'), check: () => new Set(plans.value.map(p => p.city).filter(Boolean)).size >= 3 },
      { id: 'allmoods', name: t('badge.allmoods'), icon: '🎭', desc: t('badge.allmoods_desc'), check: () => new Set(diaryEntries.value.map(e => e.mood).filter(Boolean)).size >= 7 },
    ];
    const allBadges = computed(() => BADGE_DEFS.map(b => ({ ...b, unlocked: b.check() })));
    const unlockedBadgeCount = computed(() => allBadges.value.filter(b => b.unlocked).length);

    // ─── Pomodoro Timer ───
    const showPomodoro = ref(false);
    const focusState = ref('idle'); // idle | running | done | break
    const focusDuration = ref(25);
    const focusRemaining = ref(0);
    const focusHistory = ref(lsLoad('lp_focus'));
    let _focusInterval = null;
    const focusTimeDisplay = computed(() => { const m = Math.floor(focusRemaining.value / 60); const s = focusRemaining.value % 60; return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; });
    const focusPlantEmoji = computed(() => {
      if (focusState.value === 'idle') return '🌱';
      if (focusState.value === 'done') return '🌳';
      if (focusState.value === 'break') return '☕';
      const pct = 1 - focusRemaining.value / (focusDuration.value * 60);
      if (pct < 0.33) return '🌱'; if (pct < 0.66) return '🌿'; return '🌲';
    });
    const totalFocusMin = computed(() => focusHistory.value.reduce((s, f) => s + (f.min || 0), 0));
    function startFocus() {
      focusState.value = 'running'; focusRemaining.value = focusDuration.value * 60;
      immersive.value = true;
      _focusInterval = setInterval(() => {
        focusRemaining.value--;
        if (focusRemaining.value <= 0) { clearInterval(_focusInterval); focusState.value = 'done'; }
      }, 1000);
    }
    function abandonFocus() { clearInterval(_focusInterval); focusState.value = 'idle'; focusRemaining.value = 0; }
    function cancelFocus() { if (focusState.value === 'running') { abandonFocus(); } showPomodoro.value = false; focusState.value = 'idle'; immersive.value = false; stopAmbient(); }
    function finishFocus() {
      const entry = { id: Date.now().toString(36), date: today(), min: focusDuration.value, ts: Date.now() };
      focusHistory.value.push(entry); lsSave('lp_focus', focusHistory.value);
      addXP(focusDuration.value >= 25 ? 15 : 8);
      focusState.value = 'break'; focusRemaining.value = 5 * 60;
      _focusInterval = setInterval(() => { focusRemaining.value--; if (focusRemaining.value <= 0) { clearInterval(_focusInterval); focusState.value = 'idle'; } }, 1000);
    }
    function endBreak() { clearInterval(_focusInterval); focusState.value = 'idle'; focusRemaining.value = 0; immersive.value = false; stopAmbient(); }

    // ─── Immersive Focus Mode ───
    const immersive = ref(false);
    const ambientSound = ref('');
    let _ambientAudio = null;
    const AMBIENT_SOUNDS = [
      { key: '', icon: '🔇', label: t('ambient.off') },
      { key: 'rain', icon: '🌧️', label: t('ambient.rain') },
      { key: 'cafe', icon: '☕', label: t('ambient.cafe') },
      { key: 'fire', icon: '🔥', label: t('ambient.fire') },
      { key: 'wave', icon: '🌊', label: t('ambient.wave') },
    ];
    // Use Web Audio API for white noise generation
    let _noiseCtx = null, _noiseNode = null, _noiseGain = null;
    function playAmbient(key) {
      stopAmbient();
      ambientSound.value = key;
      if (!key) return;
      try {
        _noiseCtx = new (window.AudioContext || window.webkitAudioContext)();
        const sr = _noiseCtx.sampleRate;
        const buf = _noiseCtx.createBuffer(1, sr * 2, sr);
        const data = buf.getChannelData(0);
        // Different noise profiles
        if (key === 'rain') { for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.3 * (0.5 + 0.5 * Math.sin(i / sr * 0.1)); }
        else if (key === 'fire') { for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.2 * (0.3 + 0.7 * Math.abs(Math.sin(i / sr * 0.3))); }
        else if (key === 'wave') { for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.25 * (0.5 + 0.5 * Math.sin(i / sr * 0.05)); }
        else { for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.15; }
        _noiseNode = _noiseCtx.createBufferSource();
        _noiseNode.buffer = buf; _noiseNode.loop = true;
        _noiseGain = _noiseCtx.createGain(); _noiseGain.gain.value = 0.5;
        // Low-pass filter for softer sound
        const filter = _noiseCtx.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.value = key === 'rain' ? 2000 : key === 'fire' ? 800 : key === 'wave' ? 1200 : 3000;
        _noiseNode.connect(filter); filter.connect(_noiseGain); _noiseGain.connect(_noiseCtx.destination);
        _noiseNode.start();
      } catch(e) { console.warn('Audio error', e); }
    }
    function stopAmbient() {
      ambientSound.value = '';
      if (_noiseNode) { try { _noiseNode.stop(); } catch(e) {} _noiseNode = null; }
      if (_noiseCtx) { try { _noiseCtx.close(); } catch(e) {} _noiseCtx = null; }
    }

    // ─── Time Capsules ───
    const capsules = ref(lsLoad('lp_capsules'));
    const showCapsuleModal = ref(false);
    const viewingCapsule = ref(null);
    const capsuleForm = ref({ deliverDate: '', content: '' });
    const capsuleMinDate = computed(() => { const d = new Date(); d.setDate(d.getDate() + 1); return toLocalDate(d); });
    function saveCapsule() {
      if (!capsuleForm.value.content.trim() || !capsuleForm.value.deliverDate) return;
      capsules.value.push({ id: Date.now().toString(36), createdDate: today(), deliverDate: capsuleForm.value.deliverDate, content: capsuleForm.value.content, opened: false });
      lsSave('lp_capsules', capsules.value); addXP(5);
      capsuleForm.value = { deliverDate: '', content: '' }; showCapsuleModal.value = false;
    }
    function viewCapsule(c) { viewingCapsule.value = c; }
    function checkCapsules() {
      const t = today(); let changed = false;
      capsules.value.forEach(c => { if (!c.opened && c.deliverDate <= t) { c.opened = true; changed = true; } });
      if (changed) lsSave('lp_capsules', capsules.value);
    }

    // ─── Registration Nudge (7 days after install) ───
    const showRegNudge = ref(false);
    function checkRegNudge() {
      if (authToken.value) return; // already registered
      if (localStorage.getItem('lp_reg_dismissed')) return; // user dismissed
      let installTs = localStorage.getItem('lp_install_ts');
      if (!installTs) {
        localStorage.setItem('lp_install_ts', String(Date.now()));
        return; // just installed, don't show yet
      }
      const daysSinceInstall = (Date.now() - parseInt(installTs)) / (1000 * 60 * 60 * 24);
      if (daysSinceInstall >= 7) {
        showRegNudge.value = true;
      }
    }
    function dismissRegNudge() {
      showRegNudge.value = false;
      localStorage.setItem('lp_reg_dismissed', '1');
    }
    function acceptRegNudge() {
      showRegNudge.value = false;
      showAuthModal.value = true;
    }

    // ─── Init ───
    onMounted(() => {
      loadPlans();
      loadDiary();
      checkCapsules();
      // Record install time for new users
      if (!localStorage.getItem('lp_install_ts')) {
        localStorage.setItem('lp_install_ts', String(Date.now()));
      }
      // Check registration nudge after short delay
      setTimeout(checkRegNudge, 3000);
    });

    // Draw charts when switching to insights tab
    watch(tab, (v) => { if (v === 'insights') nextTick(() => { drawMoodChart(); drawPieChart(); }); });
    watch(pieDateOffset, () => nextTick(drawPieChart));

    // ─── Hot Events ───
    const hotCategory = ref(t('hot.all'));
    const hotExpanded = ref(false);
    const allCityEvents = computed(() => {
      const city = planCity.value;
      return (HOT_EVENTS[city] || HOT_EVENTS['_default']).sort((a, b) => b.heat - a.heat);
    });
    const hotCategories = computed(() => {
      const tags = [...new Set(allCityEvents.value.map(e => e.tag))];
      return [t('hot.all'), ...tags];
    });
    const hotEvents = computed(() => {
      const cat = hotCategory.value;
      const list = cat === t('hot.all') ? allCityEvents.value : allCityEvents.value.filter(e => e.tag === cat);
      return hotExpanded.value ? list : list.slice(0, 4);
    });
    const hotHasMore = computed(() => {
      const cat = hotCategory.value;
      const list = cat === t('hot.all') ? allCityEvents.value : allCityEvents.value.filter(e => e.tag === cat);
      return list.length > 4;
    });
    watch(hotCategory, () => { hotExpanded.value = false; });
    watch(planCity, () => { hotCategory.value = t('hot.all'); hotExpanded.value = false; });
    function toggleHotExpand() { hotExpanded.value = !hotExpanded.value; }
    const hotDetail = ref(null); // currently viewed event detail
    function openHotDetail(ev) { hotDetail.value = ev; }
    function closeHotDetail() { hotDetail.value = null; }
    function parseEventDate(s) {
      const y = new Date().getFullYear();
      let m, d;
      // "8月8日"
      if ((m = s.match(/(\d{1,2})月(\d{1,2})日/))) return `${y}/${String(m[1]).padStart(2,'0')}/${String(m[2]).padStart(2,'0')}`;
      // "4月/10月" or "4月" or "5-8月"
      if ((m = s.match(/(\d{1,2})月/))) return `${y}/${String(m[1]).padStart(2,'0')}/01`;
      return today();
    }
    let _fromHotEvent = false;
    function addHotEvent(ev) {
      const evDate = parseEventDate(ev.date);
      const notes = [`${ev.tag} · ${ev.date}`, ev.addr ? `${t('hot.addr')}: ${ev.addr}` : '', ev.route ? `${t('hot.transit')}: ${ev.route}` : '', ev.docs ? `${t('hot.docs_label')}: ${ev.docs}` : '', ev.tips ? `${t('hot.tips_label')}: ${ev.tips}` : ''].filter(Boolean).join('\n');
      planForm.value = { ...emptyPlanForm(), date: evDate, city: planCity.value, title: ev.title, category: 'other', location: ev.loc || ev.addr || '', notes };
      activityQuery.value = ev.title;
      addressQuery.value = ev.addr || ev.loc || '';
      editingPlan.value = null;
      quickActionSubs.value = null;
      _fromHotEvent = true;
      showPlanModal.value = true;
    }

    // When switching to plan tab, open modal with city prefilled
    watch(showPlanModal, v => {
      if (v && !editingPlan.value && !quickActionSubs.value && !_fromHotEvent) {
        planForm.value = { ...emptyPlanForm(), date: planDate.value, city: planCity.value };
        activityQuery.value = '';
        addressQuery.value = '';
        showActivityDropdown.value = false;
        showAddressDropdown.value = false;
        addressSuggestions.value = [];
      }
      _fromHotEvent = false;
      if (!v) quickActionSubs.value = null; // reset on close
    });

    // ─── Auth & Cloud Sync ───
    const TL_API = localStorage.getItem('lp_api') || 'https://api.pindou.top';
    const authToken = ref(localStorage.getItem('lp_token') || '');
    const authEmail = ref(localStorage.getItem('lp_email') || '');
    const authPassword = ref('');
    const authMode = ref('login');
    const authError = ref('');
    const authLoading = ref(false);
    const showAuthModal = ref(false);
    const showAccountPanel = ref(false);
    const syncStatus = ref(authToken.value ? 'idle' : 'idle');
    const syncTitle = computed(() => {
      if (!authToken.value) return t('sync.no_login');
      const m = { idle: t('sync.idle'), syncing: t('sync.syncing'), synced: t('sync.done'), error: t('sync.error') };
      return m[syncStatus.value] || '';
    });

    function onProfileClick() {
      if (authToken.value) {
        showAccountPanel.value = true;
      } else {
        showAuthModal.value = true;
      }
    }

    async function doAuth() {
      authError.value = '';
      const email = authEmail.value.trim().toLowerCase();
      const password = authPassword.value;
      if (!email || !email.includes('@')) { authError.value = t('auth.invalid_email'); return; }
      if (!password || password.length < 6) { authError.value = t('auth.pw_short'); return; }
      authLoading.value = true;
      try {
        const endpoint = authMode.value === 'register' ? '/api/tl/register' : '/api/tl/login';
        const resp = await fetch(TL_API + endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, nickname: profile.value?.nickname || '' }),
        });
        const data = await resp.json();
        if (!resp.ok) { authError.value = data.error || t('auth.fail'); return; }
        authToken.value = data.token;
        localStorage.setItem('lp_token', data.token);
        localStorage.setItem('lp_email', email);
        showAuthModal.value = false;
        authPassword.value = '';
        await cloudSync('upload');
      } catch (e) {
        authError.value = t('auth.network');
      } finally {
        authLoading.value = false;
      }
    }

    function doLogout() {
      authToken.value = '';
      localStorage.removeItem('lp_token');
      localStorage.removeItem('lp_email');
      authEmail.value = '';
      syncStatus.value = 'idle';
      showAccountPanel.value = false;
    }

    async function cloudSync(direction) {
      if (!authToken.value) return;
      syncStatus.value = 'syncing';
      try {
        if (direction === 'upload') {
          const body = {
            profile: localStorage.getItem('lp_profile') || '{}',
            plans: localStorage.getItem('lp_plans') || '[]',
            diary: localStorage.getItem('lp_diary') || '[]',
            motto: localStorage.getItem('lp_motto') || '',
            city: localStorage.getItem('lp_city') || '',
            theme: localStorage.getItem('lp_theme') || '',
            bgTheme: localStorage.getItem('lp_bg') || 'coffee',
          };
          const resp = await fetch(TL_API + '/api/tl/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken.value },
            body: JSON.stringify(body),
          });
          if (!resp.ok) {
            if (resp.status === 401) { doLogout(); return; }
            throw new Error('sync failed');
          }
          syncStatus.value = 'synced';
        } else {
          const resp = await fetch(TL_API + '/api/tl/sync', {
            headers: { 'Authorization': 'Bearer ' + authToken.value },
          });
          if (!resp.ok) {
            if (resp.status === 401) { doLogout(); return; }
            throw new Error('sync failed');
          }
          const data = await resp.json();
          if (data.profile && data.profile !== '{}') { localStorage.setItem('lp_profile', data.profile); profile.value = JSON.parse(data.profile); }
          if (data.plans && data.plans !== '[]') { localStorage.setItem('lp_plans', data.plans); plans.value = JSON.parse(data.plans); }
          if (data.diary && data.diary !== '[]') { localStorage.setItem('lp_diary', data.diary); diaryEntries.value = JSON.parse(data.diary); }
          if (data.motto) { localStorage.setItem('lp_motto', data.motto); userMotto.value = data.motto; }
          if (data.city) { localStorage.setItem('lp_city', data.city); planCity.value = data.city; }
          if (data.theme) { localStorage.setItem('lp_theme', data.theme); setTheme(data.theme); }
          if (data.bgTheme) { localStorage.setItem('lp_bg', data.bgTheme); setBgTheme(data.bgTheme); }
          syncStatus.value = 'synced';
          showAccountPanel.value = false;
        }
      } catch (e) {
        syncStatus.value = 'error';
      }
    }

    let _syncTimer = null;
    function scheduleSync() {
      if (!authToken.value) return;
      clearTimeout(_syncTimer);
      _syncTimer = setTimeout(() => cloudSync('upload'), 3000);
    }
    watch(plans, scheduleSync, { deep: true });
    watch(diaryEntries, scheduleSync, { deep: true });
    watch(userMotto, scheduleSync);
    watch(planCity, scheduleSync);
    watch(themeColor, scheduleSync);
    watch(bgTheme, scheduleSync);

    onMounted(() => {
      if (authToken.value) {
        setTimeout(() => cloudSync('upload'), 2000);
      }
    });

    return {
      // i18n
      t, currentLang, setLang, i18nLangs: I18N.getLangs(),
      // Onboarding
      showOnboarding, onboardStep, obNickname, obAvatar, obCity, obAge,
      onboardNext, onboardBack, profile,
      avatars: AVATARS,
      PLAN_EMOJIS, PLAN_COLORS,
      quickActions: QUICK_ACTIONS, quickAdd, quickActionSubs,
      hotEvents, addHotEvent, hotCategory, hotCategories, hotExpanded, hotHasMore, toggleHotExpand, hotDetail, openHotDetail, closeHotDetail,
      dailyQuote, refreshQuote, userMotto, editingMotto, mottoInput, startEditMotto, saveMotto, deleteMotto,
      tab, tabBar, tabIndicatorStyle, aiProvider,
      themeColors, themeColor, showThemePicker, setTheme,
      bgThemes, bgTheme, setBgTheme,
      // Plan
      planDate, planCity, plans, filteredPlans, next7Days,
      showPlanModal, editingPlan, planForm,
      savePlan, editPlan, deletePlan, skipPlan, sharePlan, toggleDone, dayReward,
      PLAN_WIDGETS, toggleWidget, bumpCounter, saveMicronote, startPlanPomodoro,
      PLAN_TEMPLATES, showTemplates, applyTemplate,
      floatingTasks, activeFloats, showFloatModal, floatForm, FLOAT_EMOJIS,
      saveFloat, bumpFloat, deleteFloat,
      // Activity selector
      activityQuery, activityTab, showActivityDropdown, filteredActivities, selectActivity,
      ACTIVITY_GROUPS, ACTIVITIES, CITIES,
      // Address autocomplete
      addressQuery, showAddressDropdown, addressSuggestions, addressLoading,
      onAddressInput, selectAddress,
      // Diary
      diaryEntries, showDiaryModal, editingDiary, diaryForm,
      saveDiary, editDiary, deleteDiary, toggleTag, moodEmoji,
      moods: MOODS, allTags: ALL_TAGS,
      // Calendar
      calYear, calMonth, calDays, calPrev, calNext,
      reviewDate, reviewDayPlans, reviewDayDiary, loadReviewDay,
      // AI
      aiPlanResult, aiPlanLoading,
      aiTransportResult, aiTransportLoading,
      aiReviewResult, aiReviewLoading,
      getHotActivities, getSuggestPlaces, getTransport, getLifeReview,
      // Insights — XP & Level
      totalXP, userLevel, levelTitle, nextLevelXP, xpProgress,
      statsOverview,
      // Insights — Charts
      moodCanvas, pieCanvas, pieDateOffset, pieDate, pieDateLabel, pieSlices,
      heatmapDays, heatmapMonths,
      reportMonth, monthReport,
      // Badges
      allBadges, unlockedBadgeCount,
      // Pomodoro
      showPomodoro, focusState, focusDuration, focusRemaining, focusTimeDisplay, focusPlantEmoji,
      immersive, ambientSound, AMBIENT_SOUNDS, playAmbient,
      focusHistory, totalFocusMin,
      startFocus, abandonFocus, cancelFocus, finishFocus, endBreak,
      // Time Capsules
      capsules, showCapsuleModal, capsuleForm, capsuleMinDate, saveCapsule,
      viewingCapsule, viewCapsule,
      // Auth & Sync
      authToken, authEmail, authPassword, authMode, authError, authLoading,
      showAuthModal, showAccountPanel, syncStatus, syncTitle,
      onProfileClick, doAuth, doLogout, cloudSync,
      // Registration Nudge
      showRegNudge, dismissRegNudge, acceptRegNudge,
    };
  }
});

app.mount('#app');
