/* ================= NHÁNH KỊCH BẢN & LÝ THUYẾT TRÒ CHƠI ================= */
const CONCEPTS={
 ultimatum:["Trò chơi tối hậu thư","Một người đề nghị cách chia, người kia chỉ được nhận hoặc từ chối; từ chối thì cả hai trắng tay. Lý thuyết nói nên nhận bất cứ gì lớn hơn 0, nhưng người thật thường từ chối phần dưới 20–30% để trừng phạt sự bất công."],
 pd:["Song đề tù nhân","Cả hai cùng hợp tác thì cùng lợi, nhưng mỗi người đều có động cơ phản bội. Phản bội là chiến lược trội; kết cục cả hai phản bội là cân bằng Nash dù tệ hơn cho cả hai."],
 repeated:["Trò chơi lặp lại và bóng của tương lai","Khi còn gặp lại nhau nhiều lần, hợp tác trở nên hợp lý vì phản bội hôm nay sẽ bị trả đũa ngày mai. Ăn miếng trả miếng thắng giải đấu của Axelrod nhờ tử tế, trả đũa nhanh và tha thứ nhanh."],
 hawkdove:["Diều hâu và bồ câu","Hai bên tranh một thứ. Hai diều hâu cùng bị thương; hai bồ câu chia đôi; diều hâu gặp bồ câu thì lấy hết. Trong một quần thể, tỷ lệ hiếu chiến tự ổn định ở một mức cân bằng."],
 chicken:["Trò chơi gà","Ai lùi trước là mất mặt, nhưng không ai lùi thì cả hai thiệt nặng. Cam kết đáng tin, kiểu đốt cầu rút lui, là cách ép đối phương nhường."],
 public:["Hàng hóa công và kẻ đi nhờ","Ai cũng hưởng lợi từ cái chung, nên mỗi người có động cơ không góp mà vẫn hưởng. Góp nhiều hơn người khác thường là thiệt, trừ khi có ràng buộc, danh tiếng hay trừng phạt."],
 commons:["Bi kịch của cải chung","Tài nguyên chung bị khai thác quá mức vì lợi của mỗi người là riêng, còn cái giá chia đều cho tất cả. Elinor Ostrom chỉ ra cộng đồng tự đặt luật và tự giám sát có thể tránh được bi kịch này."],
 stag:["Săn hươu","Cùng săn hươu thì ai cũng no, nhưng ai bỏ đi bắt thỏ thì người còn lại trắng tay. Có hai cân bằng: cùng hợp tác (tốt) và cùng chơi an toàn (kém). Lòng tin quyết định rơi vào đâu."],
 trust:["Trò chơi lòng tin","Đưa tiền cho người khác thì tiền sinh lời gấp ba, nhưng họ trả lại bao nhiêu là tùy họ. Lý thuyết nói đừng đưa; người thật thường đưa, và thường được trả lại một phần."],
 batna:["BATNA: phương án thay thế tốt nhất","Sức mạnh mặc cả nằm ở việc bạn có thể bỏ đi hay không. Một lời mời khác trong tay thay đổi hoàn toàn cuộc thương lượng, kể cả khi bạn không dùng tới."],
 bos:["Trận chiến giới tính","Hai người đều muốn ở cùng nhau nhưng thích hai nơi khác nhau. Vấn đề không phải xung đột mà là phối hợp: ai nhường, và luân phiên có công bằng không."],
 winner:["Lời nguyền người thắng","Đấu giá một thứ có giá trị không chắc, người trả cao nhất thường là người lạc quan nhất, nên hay trả quá giá. Nên trả thấp hơn ước lượng của chính mình."],
 attrition:["Chiến tranh tiêu hao","Hai bên chịu thiệt từng ngày cho đến khi một bên bỏ cuộc. Chi phí đã bỏ ra là chi phí chìm; câu hỏi duy nhất là tiếp tục từ đây có đáng không."],
 signal:["Tín hiệu","Bằng cấp có giá trị một phần vì nó tốn kém: chỉ người có khả năng mới chịu nổi, nên nhà tuyển dụng tin được. Tín hiệu rẻ thì ai cũng gửi, và nó mất giá."],
 volunteer:["Song đề người tình nguyện","Chỉ cần một người đứng ra là cả nhóm được lợi, nhưng ai đứng ra thì chịu chi phí. Nhóm càng đông, mỗi người càng ít chịu làm, và nhiều khi không ai làm."],
 ev:["Giá trị kỳ vọng","Nhân mỗi kết cục với xác suất rồi cộng lại. Một ván cược kỳ vọng dương vẫn có thể làm bạn phá sản nếu bạn không đủ vốn để chơi nhiều lần."],
 strategy:["Đọc chiến lược của người khác","Qua nhiều lần tương tác có thể đoán người kia chơi kiểu nào: tử tế, tham, ăn miếng trả miếng hay không bao giờ tha thứ. Biết chiến lược của họ là biết cách chơi với họ."],
 nash:["Cân bằng Nash","Trạng thái mà không ai muốn đổi nước đi nếu người kia giữ nguyên. Không nhất thiết là kết cục tốt nhất cho mọi người, chỉ là kết cục mà không ai đơn phương thoát ra được."]
};
const STRATS={
 tft:["ăn miếng trả miếng","Hợp tác trước, rồi làm đúng như bạn vừa làm với họ."],
 nice:["luôn tử tế","Hợp tác bất kể bạn làm gì."],
 greedy:["luôn tham","Phản bội bất kể bạn làm gì."],
 grim:["không tha thứ","Hợp tác cho đến khi bị phản bội một lần, rồi phản bội mãi."],
 random:["thất thường","Tung đồng xu."],
 pavlov:["thắng giữ, thua đổi","Lặp lại nước đi nếu lần trước có lợi, đổi nếu thiệt."]};

function anyName(L){return pick(L.r,NAMES[L.c.nm][L.r()<.5?"M":"F"])}
function learn(L,id){L.codex=L.codex||{};if(!L.codex[id]){L.codex[id]=L.age;log(L,`Sổ tay mở thêm một trang: ${CONCEPTS[id][0]}.`,"")}}
function trait(L,k,v){L.traits=L.traits||{coop:0,fair:0,risk:0,bold:0};L.traits[k]+=v}
function gt(L,win){L.gt=L.gt||{n:0,w:0};L.gt.n++;if(win)L.gt.w++}
function scene(L,o){L.pending=o}
function later(L,years,fn){(L.queue=L.queue||[]).push({at:L.age+years,fn})}
function runQueue(L){if(!L.queue||L.pending)return;const due=L.queue.filter(x=>x.at<=L.age);if(!due.length)return;
  L.queue=L.queue.filter(x=>x.at>L.age);due[0].fn(L);for(const x of due.slice(1))L.queue.push({at:L.age+1,fn:x.fn})}
function unit(L){return Math.max(200,Math.round((L.income>0?L.income/(typeof seasonIncomeMult==="function"?seasonIncomeMult(L):1):incomeAt(L.c,.5))*.15))} // R24: đơn vị cược tính trên lương gốc
const pdMatrix=(u,who)=>({who,me:["Hợp tác","Phản bội"],them:["Hợp tác","Phản bội"],cells:[[[2*u,2*u],[0,3*u]],[[3*u,0],[u/2,u/2]]],unit:"$ PPP"});

/* ---- Phong cách chơi ---- */
function playStyle(L){const t=L.traits||{coop:0,fair:0,risk:0,bold:0};const g=L.gt||{n:0,w:0};
  let name,desc;
  if(t.coop>=4&&t.fair>=2){name="Người hợp tác có điều kiện";desc="Bạn tin trước, nhưng không để bị lợi dụng. Đây là kiểu chơi thắng nhiều giải đấu lặp lại nhất."}
  else if(t.coop<=-3){name="Kẻ đi nhờ";desc="Bạn hưởng phần chung mà ít khi góp. Hiệu quả ngắn hạn, nhưng danh tiếng mòn dần."}
  else if(t.bold>=4){name="Diều hâu";desc="Bạn hiếm khi lùi. Thắng lớn khi gặp bồ câu, thiệt nặng khi gặp diều hâu khác."}
  else if(t.risk>=3){name="Người đặt cược";desc="Bạn chọn phương án kỳ vọng cao dù rủi ro lớn. Về lâu dài, phương sai là thứ giết người ta."}
  else if(t.fair>=4){name="Người giữ lẽ công bằng";desc="Bạn sẵn sàng chịu thiệt để trừng phạt bất công. Tốn kém, nhưng chính những người như bạn làm cho hợp tác tồn tại."}
  else if(t.coop>=2){name="Người tử tế";desc="Bạn hợp tác gần như vô điều kiện. Dễ sống, nhưng dễ bị kẻ tham khai thác."}
  else{name="Người thực dụng";desc="Bạn tính từng trường hợp, không theo nguyên tắc nào cố định."}
  return{name,desc,t,g}}
