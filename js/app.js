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
  { key: 'great',   emoji: '😄', label: '很棒' },
  { key: 'good',    emoji: '🙂', label: '不错' },
  { key: 'neutral', emoji: '😐', label: '一般' },
  { key: 'sad',     emoji: '😔', label: '低落' },
  { key: 'angry',   emoji: '😤', label: '生气' },
  { key: 'anxious', emoji: '😰', label: '焦虑' },
  { key: 'love',    emoji: '🥰', label: '幸福' },
];

const ALL_TAGS = ['读书','健身','跑步','约会','工作','学习','旅行','购物','美食','电影','音乐','游戏','家务','发呆','加班','聚餐'];

// ─── 预设活动（分类） ───
const ACTIVITY_GROUPS = [
  { label: '🔥 热门', items: ['逛展览','吃火锅','遛狗','逛公园','跑步','喝咖啡','看电影','露营','探店打卡','骑行'] },
  { label: '🍜 美食', items: ['吃火锅','吃烧烤','喝咖啡','吃日料','吃西餐','喝下午茶','吃早茶','吃川菜','吃粤菜','探店打卡','吃甜品','喝奶茶'] },
  { label: '🛍 购物', items: ['逛商场','逛超市','逛市集','买衣服','逛书店','逛花市'] },
  { label: '🎬 文娱', items: ['看电影','逛展览','看演出','听音乐会','看话剧','逛博物馆','逛美术馆','看脱口秀','唱K','密室逃脱','剧本杀'] },
  { label: '🏃 运动', items: ['跑步','健身','游泳','打羽毛球','打篮球','骑行','爬山','瑜伽','滑板','攀岩','飞盘'] },
  { label: '🌳 户外', items: ['逛公园','野餐','露营','钓鱼','遛狗','散步','骑车兜风','看日落','放风筝'] },
  { label: '👫 社交', items: ['朋友聚餐','家庭聚会','约会','见客户','团建','轰趴'] },
  { label: '🏠 生活', items: ['理发','看医生','洗车','搬家','做家务','寄快递','办证件'] },
  { label: '📚 学习', items: ['上课','自习','开会','面试','写代码','画画','弹琴','练字'] },
  { label: '✈️ 旅行', items: ['坐高铁','坐飞机','自驾游','逛景点','泡温泉','住民宿'] },
];
// flat list for search
const ACTIVITIES = ACTIVITY_GROUPS.flatMap(g => g.items);

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
      const tabs = ['plan', 'diary', 'review'];
      const idx = tabs.indexOf(tab.value);
      const pct = 100 / tabs.length;
      return { left: (idx * pct) + '%', width: pct + '%' };
    });
    const aiProvider = ref(localStorage.getItem('lp_aiProvider') || 'deepseek');

    // ─── Theme Color Picker ───
    const themeColors = [
      { value: '#5f7d6e', label: '墨绿' },
      { value: '#6a9cad', label: '天蓝' },
      { value: '#8a7ba8', label: '薰衣草' },
      { value: '#c26e6e', label: '玫瑰' },
      { value: '#c59a5f', label: '琥珀' },
      { value: '#5a8f9a', label: '青碧' },
      { value: '#b07a8a', label: '桃粉' },
      { value: '#6b7b8d', label: '石墨' },
    ];
    const themeColor = ref(localStorage.getItem('lp_theme') || '#5f7d6e');
    const showThemePicker = ref(false);
    function setTheme(color) {
      themeColor.value = color;
      localStorage.setItem('lp_theme', color);
      document.documentElement.style.setProperty('--indigo', color);
      showThemePicker.value = false;
    }
    // Apply saved theme on load
    onMounted(() => {
      const saved = localStorage.getItem('lp_theme');
      if (saved) document.documentElement.style.setProperty('--indigo', saved);
    });

    watch(aiProvider, v => localStorage.setItem('lp_aiProvider', v));

    // ─── Daily Quote + User Motto ───
    const DAILY_QUOTES = [
      { text: '生活不是等待暴风雨过去，而是学会在雨中跳舞。', author: '维维安·格林' },
      { text: '种一棵树最好的时间是十年前，其次是现在。', author: '中国谚语' },
      { text: '不要因为走得太远，而忘记为什么出发。', author: '纪伯伦' },
      { text: '世界上只有一种英雄主义，就是看清生活的真相后依然热爱它。', author: '罗曼·罗兰' },
      { text: '把每一天当作生命的最后一天来过，总有一天你会发现自己是对的。', author: '乔布斯' },
      { text: '你要做一个不动声色的大人了，不准情绪化。', author: '村上春树' },
      { text: '我们终此一生，就是要摆脱他人的期待，找到真正的自己。', author: '伍绮诗' },
      { text: '人生就像骑自行车，要保持平衡就得不断前进。', author: '爱因斯坦' },
      { text: '所有伟大的行为和思想，都有一个微不足道的开始。', author: '加缪' },
      { text: '你无法改变风的方向，但你可以调整帆的角度。', author: '吉米·迪恩' },
      { text: '生命中最困难的时刻，也许正是转变的时刻。', author: '毕淑敏' },
      { text: '一个人的价值，在于他贡献了什么，而不在于他能获得什么。', author: '爱因斯坦' },
      { text: '当你觉得为时已晚的时候，恰恰是最早的时候。', author: '哈佛校训' },
      { text: '每一个不曾起舞的日子，都是对生命的辜负。', author: '尼采' },
      { text: '悲观者在每个机会中看到困难，乐观者在每个困难中看到机会。', author: '丘吉尔' },
      { text: '做你害怕做的事情，然后你会发现，不过如此。', author: '拉尔夫·爱默生' },
      { text: '日拱一卒，功不唐捐。', author: '曾国藩' },
      { text: '既然选择了远方，便只顾风雨兼程。', author: '汪国真' },
      { text: '永远不要放弃你真正想要的东西。等待虽难，但后悔更甚。', author: '马克·吐温' },
      { text: '我不去想是否能够成功，既然选择了远方，便只顾风雨兼程。', author: '汪国真' },
      { text: '生活就像海洋，只有意志坚强的人才能到达彼岸。', author: '马克思' },
      { text: '不要去追一匹马，用追马的时间种草。', author: '丰子恺' },
      { text: '纵有疾风起，人生不言弃。', author: '保尔·瓦雷里' },
      { text: '任何值得到达的地方都没有捷径。', author: '贝弗利·希尔斯' },
      { text: '心之所向，素履以往。', author: '七堇年' },
      { text: '只有流过血的手指，才能弹出世间的绝唱。', author: '泰戈尔' },
      { text: '努力不一定成功，但放弃一定失败。', author: '李嘉诚' },
      { text: '你不能控制风向，但你可以调整风帆。', author: '本杰明·富兰克林' },
      { text: '自律给我自由。', author: 'Keep 标语' },
      { text: '星光不问赶路人，时光不负有心人。', author: '大冰' },
      { text: '知不足而奋进，望远山而前行。', author: '左传' },
    ];
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
    const planCity = ref(localStorage.getItem('lp_city') || '上海');
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

    function emptyPlanForm() {
      const t = nowTime();
      return { date: today(), time_start: t, time_end: plusHours(t, 2), title: '', location: '', city: planCity.value, category: 'other', notes: '' };
    }

    // ─── Quick Action Cards ───
    const QUICK_ACTIONS = [
      { emoji: '📈', title: '今日投资计划', cat: 'work', subs: ['看盘复盘','研究个股','调整仓位','学习财报','定投基金','记录交易笔记','阅读研报','模拟交易'] },
      { emoji: '🏃', title: '跑步', cat: 'exercise', subs: ['晨跑3公里','夜跑5公里','公园慢跑','操场间歇跑','跑步机','马拉松训练','跑后拉伸','跑步打卡'] },
      { emoji: '💪', title: '健身', cat: 'exercise', subs: ['胸肌训练','背部训练','腿部训练','核心训练','手臂训练','HIIT燃脂','拉伸放松','有氧运动'] },
      { emoji: '📚', title: '读书学习', cat: 'work', subs: ['读书1小时','背单词','刷题','看网课','写笔记','练习编程','考证复习','听播客'] },
      { emoji: '🍜', title: '约饭', cat: 'food', subs: ['火锅','烧烤','日料','东南亚菜','西餐','川菜','粤菜','韩餐','自助餐','小龙虾','下午茶','深夜食堂'] },
      { emoji: '☕', title: '喝咖啡', cat: 'food', subs: ['美式咖啡','拿铁','手冲咖啡','探店打卡','咖啡+读书','咖啡+办公','约人喝咖啡','尝试新品'] },
      { emoji: '🎬', title: '看电影', cat: 'other', subs: ['院线新片','经典老片','纪录片','动画电影','漫威/DC','文艺片','恐怖片','喜剧片','情侣约片','朋友观影'] },
      { emoji: '🧘', title: '瑜伽冥想', cat: 'exercise', subs: ['晨间冥想','睡前冥想','瑜伽30分钟','拉伸瑜伽','流瑜伽','阴瑜伽','呼吸练习','正念训练'] },
    ];
    const quickActionSubs = ref(null); // current sub-activities from quick action

    // Map activity names to sub-activities for drill-down
    const ACTIVITY_SUBS = {
      '吃火锅': ['重庆老火锅','潮汕牛肉锅','铜锅涮肉','椰子鸡','番茄锅','菌汤锅','自助火锅','海底捞'],
      '吃烧烤': ['东北烧烤','日式烧鸟','韩式烤肉','大排档烧烤','自助烤肉','露天BBQ'],
      '吃日料': ['寿司','拉面','居酒屋','刺身','天妇罗','烤鳗鱼','日式烤肉','omakase'],
      '吃西餐': ['意大利面','牛排','法餐','披萨','汉堡','brunch','西班牙菜','墨西哥菜'],
      '吃川菜': ['水煮鱼','麻辣香锅','串串香','冒菜','钵钵鸡','夫妻肺片','回锅肉'],
      '吃粤菜': ['早茶','烧腊','煲仔饭','白切鸡','肠粉','虾饺','叉烧'],
      '喝下午茶': ['英式下午茶','甜品店','蛋糕','奶茶','冰淇淋','探店打卡'],
      '看电影': ['院线新片','经典老片','纪录片','动画电影','漫威/DC','文艺片','恐怖片','喜剧片'],
      '逛展览': ['美术展','摄影展','当代艺术','科技展','设计展','沉浸式体验','画廊'],
      '跑步': ['晨跑3公里','夜跑5公里','公园慢跑','操场间歇跑','跑步机','马拉松训练'],
      '健身': ['胸肌训练','背部训练','腿部训练','核心训练','HIIT燃脂','拉伸放松','有氧运动'],
      '游泳': ['自由泳','蛙泳','仰泳','蝶泳','水中健身','游泳打卡'],
      '爬山': ['近郊徒步','城市绿道','登山步道','夜爬','周末远足'],
      '逛公园': ['散步','野餐','放风筝','拍照','晒太阳','看花'],
      '露营': ['帐篷露营','车顶露营','烧烤露营','星空露营','湖边露营'],
      '喝咖啡': ['美式咖啡','拿铁','手冲咖啡','探店打卡','咖啡+读书','咖啡+办公'],
      '朋友聚餐': ['火锅局','烧烤局','KTV','桌游','剧本杀','密室逃脱','轰趴'],
    };

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
        planForm.value.category = 'other';
        // auto-set category
        const catMap = { '吃':'food','喝':'food','探店':'food','逛商':'shopping','逛超':'shopping','逛市':'shopping','买':'shopping','逛书':'shopping','逛花':'shopping','看电':'other','逛展':'other','看演':'other','听':'other','看话':'other','逛博':'other','逛美':'other','看脱':'other','唱':'other','密室':'other','剧本':'other','跑步':'exercise','健身':'exercise','游泳':'exercise','打':'exercise','骑行':'exercise','爬山':'exercise','瑜伽':'exercise','滑板':'exercise','攀岩':'exercise','飞盘':'exercise','逛公':'other','野餐':'travel','露营':'travel','钓鱼':'other','遛狗':'other','散步':'exercise','朋友':'social','家庭':'social','约会':'social','见客':'work','团建':'social','轰趴':'social','上课':'work','自习':'work','开会':'work','面试':'work','写代':'work','坐':'travel','自驾':'travel','逛景':'travel','泡温':'travel','住民':'travel' };
        for (const [prefix, cat] of Object.entries(catMap)) {
          if (a.startsWith(prefix)) { planForm.value.category = cat; break; }
        }
        return;
      }
      planForm.value.title = a;
      activityQuery.value = a;
      showActivityDropdown.value = false;
      // auto-set category
      const catMap = { '吃':'food','喝':'food','探店':'food','逛商':'shopping','逛超':'shopping','逛市':'shopping','买':'shopping','逛书':'shopping','逛花':'shopping','看电':'other','逛展':'other','看演':'other','听':'other','看话':'other','逛博':'other','逛美':'other','看脱':'other','唱':'other','密室':'other','剧本':'other','跑步':'exercise','健身':'exercise','游泳':'exercise','打':'exercise','骑行':'exercise','爬山':'exercise','瑜伽':'exercise','滑板':'exercise','攀岩':'exercise','飞盘':'exercise','逛公':'other','野餐':'travel','露营':'travel','钓鱼':'other','遛狗':'other','散步':'exercise','朋友':'social','家庭':'social','约会':'social','见客':'work','团建':'social','轰趴':'social','上课':'work','自习':'work','开会':'work','面试':'work','写代':'work','坐':'travel','自驾':'travel','逛景':'travel','泡温':'travel','住民':'travel' };
      for (const [prefix, cat] of Object.entries(catMap)) {
        if (a.startsWith(prefix)) { planForm.value.category = cat; break; }
      }
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
      const city = planForm.value.city || '上海';
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
      const labels = ['今天', '明天', '后天'];
      const weekDays = ['周日','周一','周二','周三','周四','周五','周六'];
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
      plans.value = lsLoad('lp_plans');
    }

    async function savePlan() {
      const f = planForm.value;
      if (!f.title) return alert('请选择或输入活动');
      planCity.value = f.city || planCity.value;
      const all = lsLoad('lp_plans');
      if (editingPlan.value) {
        const idx = all.findIndex(p => p.id === editingPlan.value);
        if (idx >= 0) all[idx] = { ...f, id: editingPlan.value };
      } else {
        f.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        all.push(f);
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
      if (!confirm('删除这个计划？')) return;
      const all = lsLoad('lp_plans').filter(p => p.id !== id);
      lsSave('lp_plans', all);
      await loadPlans();
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
          // just completed → confetti + highlight
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
      const stars = done >= 5 ? 3 : done >= 3 ? 2 : done >= 1 ? 1 : 0;
      const titles = ['还没开始哦', '初露锋芒 ✨', '势不可挡 🔥', '超级达人 🏆'];
      return { total, done, stars, title: titles[stars] };
    });

    // ─── Share ───
    async function sharePlan(p) {
      const text = `📌 ${p.date} ${p.time_start}-${p.time_end}\n${p.title}${p.location ? ' @ ' + p.location : ''}${p.city ? ' · ' + p.city : ''}\n\n— 来自「时光记」`;
      if (navigator.share) {
        try {
          await navigator.share({ title: '时光记 · 计划分享', text });
        } catch(e) {}
      } else {
        try {
          await navigator.clipboard.writeText(text);
          alert('已复制到剪贴板，可以发给朋友啦');
        } catch(e) {
          prompt('复制以下内容分享给朋友：', text);
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
      if (!f.content) return alert('请写点什么吧');
      const all = lsLoad('lp_diary');
      if (editingDiary.value) {
        const idx = all.findIndex(e => e.id === editingDiary.value);
        if (idx >= 0) all[idx] = { ...f, id: editingDiary.value };
      } else {
        f.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        all.push(f);
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
      if (!confirm('删除这条日记？')) return;
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
      return { error: 'AI 功能暂不可用（静态部署模式）' };
    }

    async function getHotActivities() {
      aiPlanResult.value = '提示：静态部署模式下 AI 功能暂不可用，请直接从下方活动列表选择';
    }

    async function getSuggestPlaces(cat) {
      aiPlanResult.value = '提示：静态部署模式下 AI 功能暂不可用';
    }

    async function getTransport(from, to) {
      aiTransportResult.value = '提示：静态部署模式下 AI 功能暂不可用';
    }

    async function getLifeReview(period) {
      aiReviewResult.value = '提示：静态部署模式下 AI 功能暂不可用';
    }

    // ─── Init ───
    onMounted(() => {
      loadPlans();
      loadDiary();
    });

    // ─── Hot Events ───
    const hotCategory = ref('全部');
    const hotExpanded = ref(false);
    const allCityEvents = computed(() => {
      const city = planCity.value;
      return (HOT_EVENTS[city] || HOT_EVENTS['_default']).sort((a, b) => b.heat - a.heat);
    });
    const hotCategories = computed(() => {
      const tags = [...new Set(allCityEvents.value.map(e => e.tag))];
      return ['全部', ...tags];
    });
    const hotEvents = computed(() => {
      const cat = hotCategory.value;
      const list = cat === '全部' ? allCityEvents.value : allCityEvents.value.filter(e => e.tag === cat);
      return hotExpanded.value ? list : list.slice(0, 4);
    });
    const hotHasMore = computed(() => {
      const cat = hotCategory.value;
      const list = cat === '全部' ? allCityEvents.value : allCityEvents.value.filter(e => e.tag === cat);
      return list.length > 4;
    });
    watch(hotCategory, () => { hotExpanded.value = false; });
    watch(planCity, () => { hotCategory.value = '全部'; hotExpanded.value = false; });
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
      const notes = [`${ev.tag} · ${ev.date}`, ev.addr ? `地址: ${ev.addr}` : '', ev.route ? `交通: ${ev.route}` : '', ev.docs ? `证件: ${ev.docs}` : '', ev.tips ? `提示: ${ev.tips}` : ''].filter(Boolean).join('\n');
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
      if (!authToken.value) return '未登录';
      const m = { idle: '等待同步', syncing: '同步中…', synced: '已同步', error: '同步失败' };
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
      if (!email || !email.includes('@')) { authError.value = '请输入有效的邮箱地址'; return; }
      if (!password || password.length < 6) { authError.value = '密码至少6位'; return; }
      authLoading.value = true;
      try {
        const endpoint = authMode.value === 'register' ? '/api/tl/register' : '/api/tl/login';
        const resp = await fetch(TL_API + endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, nickname: profile.value?.nickname || '' }),
        });
        const data = await resp.json();
        if (!resp.ok) { authError.value = data.error || '操作失败'; return; }
        authToken.value = data.token;
        localStorage.setItem('lp_token', data.token);
        localStorage.setItem('lp_email', email);
        showAuthModal.value = false;
        authPassword.value = '';
        await cloudSync('upload');
      } catch (e) {
        authError.value = '网络错误，请检查网络连接';
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

    onMounted(() => {
      if (authToken.value) {
        setTimeout(() => cloudSync('upload'), 2000);
      }
    });

    return {
      // Onboarding
      showOnboarding, onboardStep, obNickname, obAvatar, obCity, obAge,
      onboardNext, onboardBack, profile,
      avatars: AVATARS,
      quickActions: QUICK_ACTIONS, quickAdd, quickActionSubs,
      hotEvents, addHotEvent, hotCategory, hotCategories, hotExpanded, hotHasMore, toggleHotExpand, hotDetail, openHotDetail, closeHotDetail,
      dailyQuote, refreshQuote, userMotto, editingMotto, mottoInput, startEditMotto, saveMotto, deleteMotto,
      tab, tabBar, tabIndicatorStyle, aiProvider,
      themeColors, themeColor, showThemePicker, setTheme,
      // Plan
      planDate, planCity, plans, filteredPlans, next7Days,
      showPlanModal, editingPlan, planForm,
      savePlan, editPlan, deletePlan, sharePlan, toggleDone, dayReward,
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
      // Auth & Sync
      authToken, authEmail, authPassword, authMode, authError, authLoading,
      showAuthModal, showAccountPanel, syncStatus, syncTitle,
      onProfileClick, doAuth, doLogout, cloudSync,
    };
  }
});

app.mount('#app');
