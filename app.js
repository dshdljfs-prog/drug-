const ADMIN_CODE = "01276461885"; // حماية شكلية فقط: لا تستخدمها لحماية بيانات حساسة.
const $ = id => document.getElementById(id);
const STORE = "aqaraty_properties_v1", SETTINGS = "aqaraty_settings_v1", THEME = "aqaraty_theme_v1";
let properties = JSON.parse(localStorage.getItem(STORE) || "[]");
let settings = JSON.parse(localStorage.getItem(SETTINGS) || '{"whatsapp":"","name":"عقاراتي"}');
let selectedImages = [];
let activeChip = "";

const demo = [
 {id:"demo1",title:"بيت عائلي بتصميم مميز",type:"بيت",deal:"بيع",price:2450000,area:210,location:"المنصورة - الدقهلية",rooms:4,baths:2,phone:"01000000000",badge:"مميز",description:"بيت واسع قريب من الخدمات والمواصلات.",images:["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80"]},
 {id:"demo2",title:"أرض سكنية بموقع ممتاز",type:"أرض",deal:"بيع",price:1250000,area:300,location:"طلخا - الدقهلية",rooms:0,baths:0,phone:"01000000000",badge:"فرصة",description:"أرض مناسبة للبناء في منطقة هادئة.",images:["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80"]},
 {id:"demo3",title:"شقة عصرية جاهزة للسكن",type:"شقة",deal:"إيجار",price:6500,area:135,location:"حي الجامعة - المنصورة",rooms:3,baths:2,phone:"01000000000",badge:"جديد",description:"شقة بتقسيم عملي وتشطيب جيد.",images:["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80"]}
];
const allProperties = () => [...properties, ...demo.filter(d=>!properties.some(p=>p.id===d.id))];
function save(){localStorage.setItem(STORE,JSON.stringify(properties));}
function money(n){return new Intl.NumberFormat("ar-EG").format(Number(n)||0)+" ج.م";}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function render(){
 const q=$("searchInput").value.trim().toLowerCase(), type=$("typeFilter").value, deal=$("dealFilter").value;
 const list=allProperties().filter(p=>(!q||(p.title+" "+p.location+" "+p.description).toLowerCase().includes(q))&&(!type||p.type===type)&&(!deal||p.deal===deal)&&(!activeChip||p.type===activeChip));
 $("propertyGrid").innerHTML=list.map(p=>`<article class="property-card"><div class="property-photo" style="background-image:url('${esc((p.images||[])[0]||"")}')">${p.badge?`<span class="property-badge">${esc(p.badge)}</span>`:""}</div><div class="property-body"><h3>${esc(p.title)}</h3><div class="location">⌖ ${esc(p.location)} · ${esc(p.deal)}</div><div class="property-meta"><span>▧ ${p.area} م²</span><span>▣ ${p.rooms||0} غرف</span><span>♧ ${p.baths||0} حمام</span></div><div class="property-bottom"><div class="price">${money(p.price)}<small>${p.deal==="إيجار"?"شهرياً":"السعر المطلوب"}</small></div><button class="contact-btn" onclick="contactAgent('${esc(p.phone)}','${esc(p.title)}')">تواصل مع الوسيط ↗</button></div></div></article>`).join("");
 $("emptyState").classList.toggle("hidden",list.length>0);$("resultCount").textContent=list.length+" نتيجة";$("statCount").textContent=allProperties().length;
}
function contactAgent(phone,title){const clean=(phone||"").replace(/\D/g,"");if(!clean||clean==="01000000000"){toast("رقم الوسيط غير متاح في الإعلان التجريبي.");return;}const intl=clean.startsWith("0")?"2"+clean:clean;const msg=encodeURIComponent("مرحباً، أنا مهتم بالعقار: "+title);window.open("https://wa.me/"+intl+"?text="+msg,"_blank");}
function toast(s){$("toast").textContent=s;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2600);}
function openAdmin(){$("adminModal").classList.remove("hidden");}
function closeAdmin(){$("adminModal").classList.add("hidden");}
$("adminOpen").onclick=openAdmin;$("closeAdmin").onclick=closeAdmin;$("adminModal").addEventListener("click",e=>{if(e.target===$("adminModal"))closeAdmin();});
$("loginForm").onsubmit=e=>{e.preventDefault();if($("adminCode").value===ADMIN_CODE){$("loginView").classList.add("hidden");$("dashboardView").classList.remove("hidden");$("loginError").textContent="";refreshAdmin();}else $("loginError").textContent="رمز الدخول غير صحيح.";};
$("logoutBtn").onclick=()=>{$("dashboardView").classList.add("hidden");$("loginView").classList.remove("hidden");$("adminCode").value="";};
function refreshAdmin(){
 $("dashTotal").textContent=properties.length;$("dashSale").textContent=properties.filter(p=>p.deal==="بيع").length;$("dashRent").textContent=properties.filter(p=>p.deal==="إيجار").length;
 $("adminPropertyList").innerHTML=properties.length?properties.map(p=>`<div class="admin-row"><img src="${esc((p.images||[])[0]||"")}" alt=""><div class="row-info"><b>${esc(p.title)}</b><small>${esc(p.type)} · ${esc(p.location)} · ${money(p.price)}</small></div><button class="edit-btn" onclick="editProperty('${p.id}')">تعديل</button><button class="delete-btn" onclick="deleteProperty('${p.id}')">حذف</button></div>`).join(""):"<p>لم تضف عقارات بعد. ابدأ بإضافة أول إعلان.</p>";
}
$("pImages").onchange=async e=>{selectedImages=[];const files=[...e.target.files];for(const f of files){if(!f.type.startsWith("image/"))continue;if(f.size>1.5*1024*1024){toast("الصورة أكبر من 1.5MB؛ يفضل ضغطها قبل الرفع.");continue;}selectedImages.push(await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(f);}));}showPreview(selectedImages);};
function showPreview(imgs){$("imagePreview").innerHTML=imgs.map(s=>`<img src="${s}" alt="معاينة الصورة">`).join("");}
$("propertyForm").onsubmit=e=>{e.preventDefault();const id=$("editId").value;const old=properties.find(p=>p.id===id);const p={id:id||"p"+Date.now(),title:$("pTitle").value.trim(),type:$("pType").value,deal:$("pDeal").value,price:Number($("pPrice").value),area:Number($("pArea").value),location:$("pLocation").value.trim(),rooms:Number($("pRooms").value)||0,baths:Number($("pBaths").value)||0,phone:$("pPhone").value.trim(),badge:$("pBadge").value,description:$("pDescription").value.trim(),images:selectedImages.length?selectedImages:(old?.images||[])};if(!p.images.length){toast("أضف صورة واحدة على الأقل أو أكمل بدون صور.");}const i=properties.findIndex(x=>x.id===id);if(i>=0)properties[i]=p;else properties.unshift(p);save();resetForm();render();refreshAdmin();toast(i>=0?"تم تحديث العقار":"تم نشر العقار بنجاح");};
function editProperty(id){const p=properties.find(x=>x.id===id);if(!p)return;$("editId").value=p.id;$("pTitle").value=p.title;$("pType").value=p.type;$("pDeal").value=p.deal;$("pPrice").value=p.price;$("pArea").value=p.area;$("pLocation").value=p.location;$("pRooms").value=p.rooms;$("pBaths").value=p.baths;$("pPhone").value=p.phone;$("pBadge").value=p.badge||"";$("pDescription").value=p.description||"";selectedImages=[];showPreview(p.images||[]);$("formHeading").textContent="تعديل العقار";$("cancelEdit").classList.remove("hidden");$("propertyForm").scrollIntoView({behavior:"smooth"});}
function deleteProperty(id){if(confirm("هل أنت متأكد من حذف هذا العقار؟")){properties=properties.filter(p=>p.id!==id);save();render();refreshAdmin();toast("تم حذف الإعلان");}}
function resetForm(){$("propertyForm").reset();$("editId").value="";selectedImages=[];$("imagePreview").innerHTML="";$("formHeading").textContent="إضافة عقار جديد";$("cancelEdit").classList.add("hidden");}
$("cancelEdit").onclick=resetForm;
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".tab-panel").forEach(x=>x.classList.add("hidden"));$("tab-"+b.dataset.tab).classList.remove("hidden");});
document.querySelectorAll(".theme-option").forEach(b=>b.onclick=()=>{document.querySelectorAll(".theme-option").forEach(x=>x.classList.toggle("selected",x===b));document.body.dataset.theme=b.dataset.theme;localStorage.setItem(THEME,b.dataset.theme);toast("تم تطبيق الثيم");});
$("settingsForm").onsubmit=e=>{e.preventDefault();settings={whatsapp:$("siteWhatsapp").value.trim(),name:$("siteName").value.trim()||"عقاراتي"};localStorage.setItem(SETTINGS,JSON.stringify(settings));toast("تم حفظ الإعدادات");};
$("searchBtn").onclick=render;$("searchInput").addEventListener("input",render);$("typeFilter").onchange=render;$("dealFilter").onchange=render;
document.querySelectorAll("[data-chip]").forEach(b=>b.onclick=()=>{activeChip=b.dataset.chip;document.querySelectorAll("[data-chip]").forEach(x=>x.classList.toggle("active",x===b));$("typeFilter").value="";render();});
const savedTheme=localStorage.getItem(THEME)||"forest";document.body.dataset.theme=savedTheme;document.querySelectorAll(".theme-option").forEach(b=>b.classList.toggle("selected",b.dataset.theme===savedTheme));
$("siteWhatsapp").value=settings.whatsapp||"";$("siteName").value=settings.name||"عقاراتي";$("year").textContent=new Date().getFullYear();render();
