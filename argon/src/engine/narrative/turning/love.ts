import { E, B, type Fork } from './kit.ts';
export const LOVE: Fork[] = [
E('l01','Ba năm chúc ngủ ngon nhầm số','{person} phát hiện bạn vẫn chúc ngủ ngon một số lạ. Người nhận vừa hỏi khi nào hai người gặp nhau.','adult,single,friend',[
B('Hẹn gặp ở nơi công cộng','Có người thật, hết tưởng tượng','Người ấy khác điều bạn nghĩ, nhưng rủ bạn giúp quán sách cuối tuần.','Thử một buổi cùng làm','Giữ liên hệ qua những lá thư','bond', ['bond','bond']),
B('Nói rõ nhầm số rồi kể về mình','Có sự thật, dễ mất phép màu','Người ấy thú nhận cũng giữ một câu chuyện tưởng tượng về bạn.','Bắt đầu lại bằng tên thật','Khép bằng một lá thư tử tế','truth', ['bond','exit']),
B('Giữ nghi thức như tình bạn xa','Có chỗ sẻ chia, chưa gặp mặt','Người ấy muốn cùng làm một tuyển tập lời chúc tự viết.','Góp bài không lộ chuyện riêng','Giữ lời chúc chỉ cho hai người','show', ['deal','care'])]),
E('l02','Ban nhạc gọi bạn là chú rể','{person} dẫn bạn tới tiệc, ban nhạc gọi nhầm bạn lên sân khấu. Người đứng cạnh cũng đang bối rối.','adult,single,friend',[
B('Cùng người ấy giải thích bằng màn chào','Có đồng minh, ngượng trước đám đông','Hai người được mời dẫn một tiệc khác như cặp chuyên trị nhầm lẫn.','Thử dẫn chung một buổi','Gặp riêng không cần sân khấu','show', ['bond','show']),
B('Tìm đúng đôi nhân vật chính','Có việc chung, bỏ vai tưởng','Người cùng bị nhầm gửi lời mời cà phê để trả chiếc hoa cài áo.','Nhận cuộc hẹn trả hoa','Rủ cả nhóm cùng gặp','bond', ['bond','bond']),
B('Xin lỗi rồi ra sân chờ cùng','Có khoảng riêng, lỡ cuộc vui','Hai người nói chuyện tới lúc tiệc tan và hẹn đi một nơi không có micro.','Giữ cuộc hẹn nhỏ','Đề nghị làm bạn trước','exit', ['bond','build'])]),
E('l03','Xem mắt nhầm nhà','{person} gửi địa chỉ thiếu một số. Nhà bạn tới đã chuẩn bị trà và cũng đang chờ người xem mắt.','adult,single,friend',[
B('Nói nhầm rồi xin ngồi trò chuyện','Có gặp gỡ thật, chưa có mai mối','Người bạn gặp muốn rủ bạn tới bữa ăn không mang danh xem mắt.','Đi một bữa nhẹ nhàng','Rủ đi với nhóm bạn','truth', ['bond','bond']),
B('Tìm nhà đúng cùng người đón nhầm','Có bạn đồng hành, chạm hai gia đình','Hai nhà quen nhau, mỗi bên muốn làm mai theo cách riêng.','Tự nói điều mình muốn','Giữ các cuộc gặp thành tình bạn','bond', ['truth','bond']),
B('Mời gia đình ấy một bữa trả lễ','Có mối quen, thêm kỳ vọng','Người chuẩn bị trà mang tới món bạn nói mình thích.','Hẹn riêng để hiểu nhau','Kể rõ mình chưa sẵn sàng','care', ['bond','truth'])]),
E('l04','Người qua mạng ở sát vách','{person} chỉ cho bạn cửa nhà của người trò chuyện suốt hai năm: sát ngay phòng bạn.','adult,single,neighbor',[
B('Gõ cửa và giới thiệu thật','Hết bí ẩn, có cơ hội gần','Hai người biết quá nhiều chuyện riêng nhưng chưa từng cùng mua bữa tối.','Thử một bữa đời thường','Giữ khoảng cách qua tin nhắn','truth', ['bond','exit']),
B('Rủ gặp ngoài khu ở','Có khởi đầu mới, còn ngượng nhà','Cuộc hẹn vui, người ấy hỏi nên nói với hàng xóm hay giữ riêng.','Cùng chọn điều công khai','Giữ cuộc hẹn trong nhóm nhỏ','bond', ['truth','bond']),
B('Đề nghị làm bạn trước đã','Giữ chỗ an tâm, chậm tình cảm','Người ấy nhờ bạn cùng chọn quà cho một cuộc hẹn khác.','Giúp và nói rõ cảm xúc mình','Giữ vai người bạn đã chọn','exit', ['truth','bond'])]),
E('l05','Người kéo bạn khỏi ao','{person} đưa khăn khi bạn vừa trượt chân xuống ao nông. Người bạn thầm thích đang giữ đôi dép.','adult,single,friend',[
B('Cảm ơn rồi mời uống trà','Có cuộc hẹn, ướt cả tự trọng','Người giữ dép giữ luôn lời mời và tới với một đôi dép mới cho bạn.','Nhận quà rồi kể thật lòng','Đổi quà thành một chuyến đi chung','bond', ['truth','bond']),
B('Đùa về cú ngã trước khi nói thích','Có tiếng cười, dễ bị coi đùa','Người ấy hỏi lần trước bạn nói thật hay chỉ diễn cho cả nhóm.','Nói rõ cảm xúc không diễn','Xin thêm thời gian tìm hiểu','truth', ['truth','probe']),
B('Rủ cả nhóm học giữ an toàn quanh nước','Có việc chung, tình chậm lại','Người ấy cùng chuẩn bị buổi học, đề nghị gặp trước giờ để tập.','Gặp tập rồi đi ăn','Giữ buổi tập theo nhóm','care', ['bond','bond'])]),
E('l06','Mẹ đăng ký hẹn hò giúp','{person} đưa bạn giấy mời chương trình làm quen ở khu. Tên bạn đã nằm trên tấm phông.','adult,single,mother',[
B('Đi nhưng tự đặt giới hạn','Có người mới, chịu áp lực sân khấu','Người cùng tham gia muốn gặp bạn lần nữa không có người dẫn.','Gặp ngoài theo ý hai người','Giữ liên hệ như bạn mới','defy', ['bond','bond']),
B('Xin làm hậu trường thay người chơi','Có cuộc vui, đổi cách gặp','Một thành viên hậu trường rủ bạn làm cùng buổi sau và ăn tối sau đó.','Nhận cả buổi làm và bữa tối','Giữ vai làm việc trong nhóm','build', ['build','build']),
B('Mời mẹ cùng nghe điều mình muốn','Rõ ý, cần nói chuyện khó','Mẹ ngừng đăng ký nhưng giới thiệu người bạn cùng sở thích để tự bạn quyết.','Nhận một cuộc gặp tự chọn','Giữ khoảng thời gian riêng','truth', ['defy','exit'])]),
E('l07','Bốn người cùng tên trong lời đoán','{person} kể lời xem vui: bạn sẽ yêu người mang một cái tên có bốn người trong nhóm đang dùng.','adult,single,friend',[
B('Mở tiệc để mọi người tự gặp','Có nhóm mới, bỏ lời đoán','Hai người trong tiệc thành đôi, còn bạn quen người phụ bếp có tên khác.','Mời người ấy một cuộc hẹn','Giữ nhóm nấu ăn cùng nhau','bond', ['bond','bond']),
B('Hỏi người mình thật sự để ý','Có câu trả lời, hết núp lời đùa','Người ấy muốn thử hẹn hò nhưng không muốn bị gọi là người ứng nghiệm.','Giữ chuyện riêng của hai người','Bắt đầu bằng một việc cùng làm','truth', ['bond','bond']),
B('Viết truyện về lời đoán','Có chất liệu, dễ bị nhận ra','Nhóm thích truyện, một người muốn đổi cái kết để hai nhân vật gặp lại.','Viết tiếp cùng người ấy','Giữ truyện hư cấu không gán người','show', ['build','bond'])]),
E('l08','Tán người ta qua máy của bố','{person} phát hiện người đáp tin bạn ba tháng qua là bố của người bạn định làm quen.','adult,single,friend',[
B('Xin lỗi rồi xin gặp đúng người','Có khởi đầu thật, chịu ngượng','Người ấy nói bố đã kể quá nhiều ưu điểm không đúng của bạn.','Gặp để kể cả điều vụng','Rủ làm bạn trước khi hẹn','truth', ['truth','build']),
B('Giữ tình bạn với người đã trò chuyện','Có người cùng chuyện, bỏ ép tình','Người bố rủ bạn tới hội cờ, người con cũng tham gia nhóm ấy.','Tới hội vì điều mình thích','Giữ liên hệ ngoài chuyện mai mối','bond', ['bond','bond']),
B('Mời cả nhà một buổi gặp rõ ràng','Hết nhầm lẫn, thêm kỳ vọng','Người con xin lần sau hai người gặp không có gia đình.','Nhận cuộc gặp riêng','Nói rõ mình cần đi chậm','deal', ['bond','truth'])]),
E('l09','Hai nhà họp vì hai con chó','{person} báo chó hai nhà gây một vụ ồn ào ngoài sân. Cuộc họp giải quyết kéo dài tới bữa tối.','adult,single,neighbor',[
B('Cùng chăm và chia trách nhiệm','Có lịch gặp, tốn công đều','Hai người quen nhau qua lịch đi dạo, rồi muốn có một cuộc gặp không có chó.','Hẹn một bữa riêng','Giữ bạn đồng hành đi dạo','care', ['bond','bond']),
B('Lập lịch dùng sân chung','Có thỏa thuận, bớt va chạm','Lịch giúp cả xóm, người cùng lập sổ rủ bạn tổ chức ngày thú cưng.','Làm ngày hội nhỏ cùng nhau','Giữ lịch sân và thời gian riêng','deal', ['show','bond']),
B('Tổ chức bữa xin lỗi hai nhà','Có tiếng cười, bị gán đôi','Người bị gán với bạn hỏi hai người có muốn tự thử xem có hợp không.','Thử một cuộc hẹn tự chọn','Cùng nói rõ chỉ là bạn','bond', ['defy','truth'])]),
E('l10','Phát biểu với tư cách người yêu cũ','{person} đưa micro cho bạn ở tiệc nhầm bàn. Người dẫn tưởng bạn là người yêu cũ của chủ lễ.','adult,single,friend',[
B('Đính chính rồi chúc bằng chuyện thật','Giữ lịch sự, nổi bật ngoài ý','Một khách cùng bàn muốn gặp vì thích cách bạn xử lý nhầm lẫn.','Nhận lời gặp riêng','Rủ cả bàn tái ngộ','truth', ['bond','bond']),
B('Chuyển micro cho đúng người','Giải nguy, có người mang ơn','Người vừa thoát màn phát biểu mời bạn đi ăn để cảm ơn.','Đi ăn không đặt tên quan hệ','Đề nghị gặp theo nhóm','care', ['bond','bond']),
B('Xin phép kể một chuyện vui vô hại','Có sân khấu, phải giữ giới hạn','Bạn được rủ dẫn tiệc chung với một người cũng từng bị gọi nhầm.','Thử dẫn đôi một buổi','Giữ liên hệ ngoài sân khấu','show', ['bond','show'])]),
E('l11','Thư tình tới chị của người ấy','{person} báo lá thư bạn nhờ đưa đã tới sai người. Người nhận lại muốn gặp bạn nói chuyện.','adult,single,friend',[
B('Gặp để nói rõ trước','Có sự thật, dễ hụt hẫng','Người nhận thư giới thiệu bạn với câu lạc bộ viết, nơi người bạn thích cũng tới.','Tới vì muốn viết thật','Giữ việc tỏ tình riêng','truth', ['build','bond']),
B('Xin nhận lại thư, tự trao đúng người','Có câu trả lời, không núp trung gian','Người nhận đúng xin thời gian, rồi rủ bạn cùng làm một việc nhỏ.','Nhận lời không ép tên gọi','Giữ một thời hạn cho mình','defy', ['bond','bond']),
B('Mời người nhận nhầm làm bạn đọc thư','Có bạn hiểu mình, tình rẽ hướng','Hai người đọc thư thành thói quen; một người hỏi có phải vẫn chỉ là bạn.','Nói cảm xúc đang đổi','Giữ ranh giới tình bạn rõ','bond', ['truth','exit'])]),
E('l12','Bài hát chia tay trong lễ cầu hôn','{person} nhận ra bạn tập nhầm lời. Người bạn muốn hỏi đang nghe tới đúng câu chia tay.','adult,single,friend',[
B('Dừng hát và nói bằng lời mình','Có lòng thật, bỏ màn hoàn hảo','Người ấy muốn cùng bàn cuộc sống trước khi trả lời chuyện cưới.','Lập kế hoạch sống thử nhịp','Hẹn thêm thời gian tìm hiểu','truth', ['build','probe']),
B('Đổi bài thành câu chuyện hai người','Có kỷ niệm riêng, cần ứng biến','Câu chuyện được nhớ hơn chiếc nhẫn, người ấy muốn viết phần tiếp cùng bạn.','Cùng viết lời hứa thực tế','Giữ kỷ niệm mà đi chậm','show', ['build','bond']),
B('Hoãn câu hỏi, mời một buổi nói chuyện','Có khoảng thở, chịu hụt sân khấu','Cuộc nói chuyện làm rõ hai ước muốn khác nhau về nơi sống.','Thử một mùa ở nơi mới','Giữ hai kế hoạch thêm một kỳ','exit', ['bond','bond'])]),
E('l13','Người yêu thuê diễn quá đạt','{person} muốn giữ liên lạc với người bạn thuê đóng người yêu về nhà. Gia đình đã chọn ngày gặp tiếp.','adult,single,mother',[
B('Nói thật với gia đình ngay','Giữ sự thật, cả nhà ngượng','Người đóng vai vẫn muốn làm bạn, nhưng không muốn tiếp tục được thuê.','Gặp lại bằng vai thật','Khép hợp đồng bằng lời cảm ơn','truth', ['bond','exit']),
B('Hỏi người ấy có muốn tìm hiểu thật','Có cơ hội, có quyền bị từ chối','Người ấy đồng ý gặp thử với điều kiện chưa kể gia đình.','Giữ nhịp hẹn hai người chọn','Làm bạn trước khi tiến thêm','bond', ['bond','build']),
B('Cùng hạ màn bằng cuộc chia tay giả cuối','Khép màn kịch, còn chuyện phải sửa','Gia đình an ủi quá nhiệt tình, bạn phải quyết lúc nào kể hết.','Kể thật và nhận phần mình','Viết thư giải thích cho nhà','show', ['truth','truth'])]),
E('l14','Hoa nhầm nhà suốt ba mùa','{person} cho bạn xem những tấm thiệp hoa đã giữ. Bạn tưởng người định tặng vẫn nhận đủ.','adult,single,neighbor',[
B('Nói rõ rồi hỏi về người nhận nhầm','Có người mới, dở một chuyện cũ','Người ấy mời bạn xem khu vườn trồng từ những cành còn sống.','Tới thăm và bắt đầu lại','Tặng cây như lời xin lỗi','truth', ['bond','care']),
B('Tự mang hoa tới người định tặng','Có câu trả lời, không còn trung gian','Người ấy đã đổi cuộc sống và muốn biết vì sao bạn giờ mới tới.','Nghe điều đã thay đổi','Khép chuyện bằng lời chúc','defy', ['bond','exit']),
B('Rủ làm một buổi tặng cây cả khu','Có việc chung, tình chưa đặt tên','Người nhận nhầm xin cùng bạn giữ khu vườn của buổi tặng cây.','Cùng chăm theo lịch','Giữ vườn thành việc cả nhóm','care', ['care','bond'])]),
E('l15','Bữa cơm tài năng gặp mất điện','{person} rủ bạn nấu trước mặt người bạn thích. Lâu nay món ngon đều do bạn đặt giao tới.','adult,single,friend',[
B('Thú nhận và cùng học một món','Có tiếng cười, mất hào quang','Người ấy gửi lịch lớp nấu cho hai người, học phí phải chia rõ.','Cùng học theo khả năng','Tự tập rồi mời bữa khác','truth', ['probe','bond']),
B('Đổi bữa thành đi chợ nấu chung','Có trải nghiệm, không giấu được vụng','Hai người thích đi chợ, nhưng chọn vị ăn hoàn toàn khác nhau.','Thử mỗi người một thực đơn','Giữ buổi chợ như tình bạn','bond', ['bond','bond']),
B('Nhờ cả nhóm cứu bữa','Có đồng đội, mất cảnh hẹn riêng','Một người giúp nấu muốn rủ bạn mở bếp cuối tuần.','Thử bếp cùng nhóm','Mời người mình thích bữa riêng','care', ['bond','bond'])]),
E('l16','Lời hứa chạy trăm cây số','{person} nhắc bạn đã khoe sẽ chạy một trăm cây số để có cuộc hẹn. Bạn chưa từng chạy quá đầu ngõ.','adult,single,friend',[
B('Đổi lời khoe thành lịch tập vừa sức','Có tiến bộ, chịu nói thật','Người ấy rủ bạn một giải đi bộ ngắn, không có phần thưởng hẹn hò.','Tham gia vì thích đi cùng','Giữ tập riêng rồi hẹn trà','probe', ['bond','bond']),
B('Xin cuộc hẹn bằng lời chân thành','Giữ sức, bỏ màn chứng minh','Người ấy nhận lời nhưng hỏi bạn còn điều gì đã khoe quá.','Kể cả những điều còn vụng','Xin tìm hiểu từ việc nhỏ','truth', ['truth','probe']),
B('Rủ nhóm gây quỹ bằng quãng đi chung','Có ý nghĩa, phải chia việc','Nhóm đủ quãng đường, người ấy muốn giữ một chuyến đi mỗi tháng.','Giữ lịch theo sức cả nhóm','Mời một chuyến riêng hai người','care', ['deal','bond'])]),
E('l17','Tình địch hóa ra là anh họ','{person} đính chính người bạn vừa chất vấn là anh họ của người mình thích. Bữa tối cả nhà sắp bắt đầu.','adult,single,friend',[
B('Xin lỗi trực tiếp trước bữa','Giữ cơ hội sửa, chịu ngượng','Người anh họ muốn bạn giúp một việc để hai người hiểu nhau hơn.','Nhận việc trong khả năng','Mời một cuộc nói chuyện bình thường','truth', ['bond','truth']),
B('Mời cả nhóm làm một việc chung','Có dịp hiểu, không ép tình','Làm chung tốt, người bạn thích hỏi vì sao bạn hay đoán thay người khác.','Nói về điều mình đang sợ','Xin đi chậm để học tin','bond', ['truth','probe']),
B('Lùi lại và sửa cách phản ứng','Có khoảng tự nhìn, tình có thể xa','Người ấy chủ động hỏi bạn có muốn gặp lại khi đã bình tĩnh.','Nhận lời với ranh rõ','Giữ bạn trước khi hẹn','exit', ['bond','bond'])]),
E('l18','Câu hỏi qua loa phát thanh','{person} lỡ phát bản tập tỏ tình của bạn qua loa khu. Câu trả lời chưa từng được hỏi trực tiếp.','adult,single,vn,neighbor',[
B('Gặp riêng để hỏi thật','Có quyền chọn cho người ấy, chịu ngượng','Người ấy muốn giữ mọi chuyện sau này khỏi loa chung.','Hẹn bằng lời hai người','Giữ một tình bạn bình thường','truth', ['bond','bond']),
B('Đính chính và nhận lỗi công khai','Giữ thể diện người ấy, hụt mình','Người ấy cảm ơn vì bạn đã trả lại quyền riêng tư, rồi mời một buổi trà.','Nhận lời không đòi câu trả lời','Để người ấy tự chọn lần sau','care', ['defy','defy']),
B('Đổi bản phát thành lời chúc cả xóm','Hạ nhiệt, chuyện tình còn riêng','Xóm muốn bạn viết lời chúc cho đôi khác, người bạn thích xin đọc thử.','Cùng viết một bài mới','Giữ việc viết ngoài chuyện tình','show', ['build','build'])]),
E('l19','Ảnh vở kịch hồi nhỏ','{person} tìm ảnh bạn đóng cặp với người đang muốn làm quen. Hai người đều quên đã hứa cưới trong vở kịch.','adult,single,friend',[
B('Gửi ảnh và rủ gặp lại','Có ký ức chung, chưa biết người nay','Người ấy mang kịch bản cũ tới, đề nghị đi xem một vở mới.','Nhận cuộc hẹn xem kịch','Rủ cả lớp cũ cùng xem','bond', ['bond','bond']),
B('Rủ lớp diễn lại một đoạn','Có hội ngộ, dễ bị gán đôi','Buổi diễn vui, hai người được giao viết cảnh kết khác tuổi nhỏ.','Viết kết bằng chuyện hiện tại','Giữ kết hài cho cả nhóm','show', ['build','bond']),
B('Hỏi người ấy bây giờ muốn gì','Có sự thật, bỏ lời hứa trẻ con','Người ấy muốn đi xa học nghề và hỏi bạn có muốn giữ liên lạc.','Thử khoảng cách bằng lịch hẹn','Chúc nhau đi theo đường riêng','truth', ['bond','bond'])]),
E('l20','Bí kíp tán tỉnh từ năm cũ','{person} đưa cuốn sổ tán tỉnh thời chưa có điện thoại. Trang đầu khuyên mang cả bao gạo tới cửa.','adult,single,mentor',[
B('Hỏi chuyện thật phía sau cuốn sổ','Có kinh nghiệm, hết công thức','Người thầy kể một lần thất bại và muốn bạn tự viết trang của mình.','Viết lời mời bằng giọng mình','Giữ sổ làm chuyện để kể','probe', ['build','build']),
B('Mời người ấy bằng điều họ thích','Có cuộc gặp thật, phải lắng nghe','Người ấy nhận lời rồi đề nghị đổi sang một sở thích bạn chưa thử.','Thử điều mới cùng nhau','Đề nghị mỗi người một lượt chọn','bond', ['bond','bond']),
B('Dựng tiểu phẩm về cuốn sổ','Có tiếng cười, dễ bị nhận ra','Một người trong nhóm thích cách bạn tự giễu và xin cùng viết tiếp.','Viết một cảnh đôi','Giữ nhóm viết mở','show', ['build','build'])]),
E('l21','Bảy vòng làm quen gia đình','{person} có nhóm anh chị em đông người, ai cũng muốn bạn qua một thử thách trước khi được mời ăn.','adult,spouse',[
B('Tham gia nhưng chọn phần tự nguyện','Có người quen, giữ giới hạn','Một thử thách thành công việc không công lặp lại, người ấy cũng thấy quá sức.','Cùng nói lại giới hạn','Chỉ giữ những buổi gặp vui','defy', ['exit','exit']),
B('Mời cả nhà thử món mình giỏi','Đổi sân, chịu chấm điểm','Món được thích, gia đình muốn bạn đứng bếp mọi dịp.','Chia ca và dạy công thức','Chỉ nấu một dịp mỗi năm','show', ['deal','bond']),
B('Xin một bữa trò chuyện bình thường','Có người thật, bỏ cuộc thi','Một người anh chị cởi mở nhờ bạn cùng giúp chuyện gia đình.','Giúp việc có điểm dừng','Giữ quan hệ qua bữa ăn','truth', ['exit','bond'])]),
E('l22','Người yêu thuộc nhà chủ nợ','{person} nhắc món nợ cũ của gia đình bạn giữa bữa ra mắt. Người ấy cũng chưa từng biết.','adult,spouse',[
B('Tách chuyện tình khỏi sổ nợ','Có ranh, khó chiều hai nhà','Chủ nợ muốn đổi kỳ trả vì hai nhà nay đã gần nhau.','Giữ thỏa thuận bằng giấy','Nhờ người trung lập đối chiếu','truth', ['deal','probe']),
B('Cùng nói thật với hai bên','Có đồng minh, chịu áp lực','Người ấy muốn cả hai góp phần trả bằng công việc chung có lương.','Thử việc không lẫn tiền nhà','Giữ mỗi người việc riêng','bond', ['build','bond']),
B('Thu xếp nợ qua kênh độc lập','Giữ tự chủ, thêm phí công','Món nợ rõ dần, gia đình bên kia mời bạn làm việc thật sự.','Ứng tuyển bằng điều kiện chung','Giữ nghề ngoài quan hệ họ hàng','probe', ['bond','bond'])]),
E('l23','Người cũ và người mới cùng họ','{person} báo bữa họp nhà có người bạn từng hẹn hò. Hai người là họ hàng và đều nghĩ bạn đã nói.','adult,spouse',[
B('Kể rõ trước khi tới bữa','Giữ tin, nghe điều khó','Bạn đời muốn thống nhất cách giữ liên hệ với người cũ trong các dịp chung.','Cùng đặt ranh hai bên chọn','Đi ít dịp một thời gian','truth', ['bond','bond']),
B('Cùng tới và chào tử tế','Có mặt thật, chịu ngượng','Bữa qua ổn, người lớn muốn giao cả nhóm tổ chức lễ tới.','Chia vai không ép thân mật','Nhận việc hậu trường riêng','bond', ['deal','bond']),
B('Xin một dịp khác để làm quen','Có khoảng thở, lỡ buổi đầu','Gia đình tổ chức bữa nhỏ hơn, muốn bạn tự kể chuyện hiện tại.','Đến với lời giới thiệu thật','Mời họ tới nơi trung lập','exit', ['bond','bond'])]),
E('l24','Người trộm xoài năm ấy','{person} nhận ra bạn từng trèo cây lấy xoài nhà mình. Hôm nay bạn tới xin ra mắt người thân của họ.','adult,spouse',[
B('Nhận lỗi và mang cây giống bù','Có cách sửa, chịu trêu lâu','Cây lớn lên, gia đình muốn bạn cùng giữ vườn cho đám cưới sắp tới.','Góp công có lịch rõ','Tặng phần cây rồi để nhà tự chăm','care', ['deal','care']),
B('Kể cả chuyện vụng của mình','Có lòng thật, bỏ hình ảnh đẹp','Người ấy thú nhận gia đình cũng từng hiểu nhầm một việc của bạn.','Cùng khép hiểu nhầm','Giữ chuyện cũ thành câu chuyện vui','truth', ['exit','bond']),
B('Rủ làm mứt từ mùa xoài tới','Có việc chung, chưa xong nghi ngờ','Mứt được khách hỏi mua, hai nhà muốn dùng làm quà chung.','Làm một mẻ theo đơn','Giữ mứt cho dịp gia đình','build', ['build','bond'])]),
E('l25','Lời đoán muốn hai người chia tay','{person} lo vì một lời xem vui không hợp tuổi. Cả hai đã đặt trước chuyến đi chung.','adult,spouse',[
B('Hỏi điều người ấy thật sự lo','Có sự thật, chưa hết bất an','Người ấy nói nỗi lo là cách hai người quản tiền, không phải tuổi.','Thử sổ chung một mùa','Giữ quỹ riêng và lịch nói chuyện','probe', ['bond','truth']),
B('Đề nghị cùng trải nghiệm trước quyết','Có dữ liệu sống, cần thời gian','Chuyến đi cho thấy hai nhịp sống rất khác, nhưng cả hai vẫn muốn thử.','Chia lịch theo điều mỗi người cần','Đi chậm hơn trước cam kết','bond', ['deal','bond']),
B('Giữ quyền quyết của mình rõ ràng','Có ranh, có thể xa nhau','Người ấy quay lại muốn nói chuyện không dựa vào lời người khác.','Nhận cuộc nói chuyện mới','Giữ khoảng cách mình đã chọn','defy', ['truth','exit'])]),
E('l26','Buổi hẹn bắt đầu bằng yoga','{person} rủ bạn tới lớp vận động nhẹ. Bạn đã khoe mình dẻo, nhưng cúi chưa tới đầu gối.','adult,single,friend',[
B('Nhận mình mới học và thử vừa sức','Có người thật, lộ điều vụng','Người ấy muốn đổi buổi sau sang sở thích bạn giỏi để được làm người mới.','Dẫn một buổi của mình','Giữ lớp chung đều mỗi tuần','truth', ['bond','bond']),
B('Xin làm người chuẩn bị phòng','Có việc cùng, đứng ngoài bài khó','Lớp muốn bạn cùng tổ chức một buổi ngoài trời với người ấy.','Chia việc có giờ nghỉ','Chỉ giúp hậu trường một buổi','care', ['deal','care']),
B('Đổi lời khoe thành lời mời đi bộ','Có cuộc gặp vừa sức, bỏ vai giỏi','Hai người quen nhịp đi, một người muốn thử chuyến xa hơn.','Tập theo lịch hai người','Giữ quãng ngắn để nói chuyện','bond', ['bond','truth'])]),
E('l27','Chiếc xe mượn lộ chủ thật','{person} tưởng bạn rất giàu vì chiếc xe và căn phòng dùng chụp ảnh. Chủ xe tới xin lấy lại giữa cuộc hẹn.','adult,single,friend',[
B('Nói rõ đời sống hiện tại','Có cơ hội thật, bỏ hào quang','Người ấy vẫn muốn gặp nhưng xin đừng có thêm màn chứng minh bằng tiền.','Hẹn bằng điều mình thích thật','Thử làm bạn trước','truth', ['bond','build']),
B('Rủ một cuộc hẹn vừa túi tiền','Có trải nghiệm chung, chịu lộ giới hạn','Buổi hẹn nhỏ vui, người ấy muốn cùng lập quỹ cho chuyến đi tự trả.','Góp theo khả năng mỗi người','Giữ từng người tự lo phần','bond', ['deal','bond']),
B('Xin dừng để sửa thói khoe','Có khoảng tự nhìn, lỡ người','Người ấy gửi lời chúc và một lời mời gặp lại nếu bạn muốn sống thật.','Nhận lời bằng lời kể thật','Khép tình nhưng giữ bài học','exit', ['truth','exit'])]),
E('l28','Hai nghề nghiệp đều là màn kịch','{person} thú nhận nghề đã khoe là nghề mơ ước. Bạn cũng đang giữ đúng một lời nói dối như vậy.','adult,single,friend',[
B('Cùng nói nghề thật','Có tiếng cười, hết vai diễn','Hai người có giờ làm lệch nhau và phải tự chọn lúc gặp không ảnh hưởng việc.','Thử lịch hẹn thực tế','Giữ liên hệ nhẹ nhàng','truth', ['bond','bond']),
B('Rủ nhau học nghề từng khoe','Có mục tiêu chung, tốn công thật','Một người tiến nhanh và được mời đi học xa, đúng lúc hai người vừa quen lịch gặp cuối tuần.','Ủng hộ và giữ lịch gặp','Chọn đường học riêng gần nhà','build', ['care','probe']),
B('Viết một vở ngắn về hai lời khoe','Có câu chuyện, dễ lộ đời riêng','Nhóm diễn thích kịch và muốn kết có hậu, hai người chưa rõ mình muốn gì.','Viết kết mở cùng nhau','Giữ kịch tách khỏi chuyện thật','show', ['build','bond'])]),
E('l29','Bố mẹ hai nhà từng là tình đầu','{person} mang ảnh cũ tới buổi ra mắt. Hai người lớn nhận ra nhau trước khi kịp chào hai đứa trẻ.','adult,spouse',[
B('Để người lớn kể rồi tự nói phần mình','Có lịch sử, giữ quyền hiện tại','Hai nhà bắt đầu thân quá nhanh, muốn quyết hộ lễ của hai bạn.','Tự chốt điều cả hai cần','Nhận giúp ở phần đã thống nhất','defy', ['bond','care']),
B('Mời một bữa tách khỏi chuyện cưới','Có người hiểu nhau, bớt áp lực','Người lớn muốn tổ chức họp bạn cũ, nhờ hai bạn cùng chuẩn bị.','Giúp một buổi có điểm dừng','Giới thiệu người tổ chức khác','bond', ['exit','build']),
B('Xin đi chậm để giữ khoảng riêng','Có nhịp của mình, dễ hụt nhà','Người ấy đề nghị một chuyến đi chỉ hai người để bàn đời sống thật.','Đi theo ngân sách hai người','Bàn ở nhà bằng lịch cụ thể','exit', ['bond','bond'])]),
E('l30','Mẹ nhắn thay người ấy','{person} cho biết những câu bạn thích suốt hai năm do mẹ người ấy góp ý. Người ấy vốn nói ít hơn nhiều.','adult,single,friend',[
B('Gặp và nghe giọng thật','Có con người thật, mất hình dung','Người ấy muốn thử liên hệ không qua ai góp lời trong một tháng.','Giữ cuộc hẹn do hai người đặt','Làm bạn để hiểu chậm hơn','truth', ['bond','build']),
B('Rủ làm việc cùng thay nhắn dài','Có trải nghiệm, bớt lời hay','Làm chung hợp, nhưng hai người khác cách phân vai.','Thử luân phiên người dẫn','Giữ mỗi người phần độc lập','build', ['bond','bond']),
B('Nói rõ mình cần riêng tư','Có ranh, gia đình dễ phật ý','Người ấy xin cả hai tự nói với gia đình và muốn bạn đứng cạnh.','Cùng nói ranh giới lịch sự','Giữ khoảng một thời gian','defy', ['truth','exit'])]),
E('l31','Hai đám cưới chung một phông','{person} dẫn bạn qua nhầm cửa tiệc. Hai phông cùng màu, ảnh cưới vừa in có lẫn cả nhóm.','adult,spouse',[
B('Cùng sửa ảnh và đổi lại đồ','Giữ kỷ niệm, thêm việc bất ngờ','Hai đôi muốn làm một album chung về ngày nhầm lẫn.','Góp ảnh có quyền duyệt','Giữ album riêng mỗi nhà','probe', ['deal','bond']),
B('Mời bàn bên sang chúc một lượt','Có bạn mới, đổi lịch lễ','Hai nhà giữ liên hệ, đề nghị cùng đi một chuyến kỷ niệm.','Thử chuyến ngắn theo sức','Giữ bữa gặp mỗi năm','bond', ['deal','bond']),
B('Biến lỗi thành tiết mục giao lưu','Có chuyện để kể, cần đồng ý','Khách muốn đôi bạn diễn lại tiết mục trong dịp mừng cưới khác.','Làm một buổi theo ý hai người','Giữ nó riêng cho ngày cưới','show', ['build','bond'])]),
E('l32','Nhẫn nằm trong nồi lẩu','{person} thấy nhẫn rơi ngay trước khi nhân viên mang nồi vào bếp. Bàn khách đang đợi màn trao nhẫn.','adult,spouse',[
B('Dừng bữa để tìm thật an toàn','Giữ nhẫn, lỡ nghi lễ','Nhẫn được tìm lại, người ấy muốn khắc câu cả hai nói lúc hoảng.','Chọn câu riêng của hai người','Giữ nhẫn nguyên như kỷ niệm','probe', ['bond','bond']),
B('Dùng vật thay tạm có xin ý','Giữ buổi, cần cùng đồng ý','Vật thay thành kỷ vật được giữ hơn nhẫn, gia đình hỏi bao giờ làm lễ lại.','Tổ chức nghi lễ nhỏ riêng','Giữ ngày cũ là đủ','bond', ['build','bond']),
B('Bỏ màn trao, nói lời hứa trước','Giữ ý nghĩa, chịu lời hỏi','Hai người muốn biến lời hứa thành một việc thực tế trong năm tới.','Chọn một mục tiêu chung','Giữ lời hứa qua lịch gặp','truth', ['bond','care'])]),
E('l33','Bạn thân đứng nhầm vai chú rể','{person} mặc áo giúp lễ giống bạn. Đội chụp ảnh đã xếp họ vào vị trí cạnh người bạn đời của bạn.','adult,friend,spouse',[
B('Sửa vị trí rồi chụp một ảnh vui','Giữ lễ, có chuyện cười','Tấm ảnh vui nổi hơn ảnh chính, người ấy muốn hai bạn chọn phần công khai.','Chọn ảnh cùng đồng thuận','Giữ ảnh chỉ trong nhà','show', ['bond','bond']),
B('Đổi phục trang để ai cũng rõ vai','Rõ người, thêm công thay','Người bạn giúp chọn áo hóa ra có nghề tổ chức và muốn rủ bạn góp một buổi.','Thử việc hậu trường chung','Giữ dịp lễ ngoài công việc','probe', ['build','bond']),
B('Bàn riêng điều khiến hai người khó chịu','Có tin, bớt màn trình diễn','Hai người thống nhất giữ các dịp sau đơn giản hơn dù gia đình thích đông.','Tự chọn dịp nhỏ của mình','Thương lượng một dịp chung mỗi năm','truth', ['defy','deal'])]),
E('l34','Đứa trẻ có hai tên gọi ở nhà','{person} muốn giữ tên mình chọn cho con. Bên nội đã dùng một tên khác từ ngày trẻ sinh.','adult,spouse,child',[
B('Cùng chốt tên và nói với hai nhà','Có ranh, có thể mất lòng','Trẻ bắt đầu tự chọn biệt danh thứ ba, chẳng giống tên người lớn nào.','Tôn trọng tên trẻ muốn dùng','Giữ tên giấy và tên nhà rõ','defy', ['bond','bond']),
B('Giữ hai tên nhưng để trẻ chọn sau','Giữ hòa, dễ lẫn cách gọi','Trường hỏi tên thường dùng, trẻ muốn tự viết vào phiếu.','Để trẻ viết phần mình','Giải thích hai tên với trường','care', ['build','truth']),
B('Kể câu chuyện từng tên cho trẻ','Có ký ức, tốn thời gian hòa giải','Trẻ viết truyện về hai tên và muốn đọc trước cả họ.','Giúp trẻ tự kể','Giữ truyện trong gia đình nhỏ','bond', ['care','bond'])]),
E('l35','Hai quỹ đen chung một hộp','{person} mở chỗ giấu tiền đúng lúc bạn cũng tới cất. Hai phong bì đều ghi đừng đụng.','adult,spouse',[
B('Mở cả hai phong bì cùng nhau','Có sự thật, mất chỗ riêng','Mỗi quỹ dành cho một giấc mơ, cả hai đều muốn giúp giấc mơ kia.','Chọn lịch cho cả hai','Giữ quyền riêng với phần chung rõ','truth', ['bond','exit']),
B('Thỏa thuận khoản tự quyết mỗi người','Có riêng tư, cần tin nhau','Một khoản chi lớn tới, hai người cân nhắc góp thêm từ phần riêng.','Góp tự nguyện theo sức','Giữ khoản chung trong khả năng','deal', ['deal','bond']),
B('Dùng một phần làm điều bất ngờ chung','Có kỷ niệm, bớt tiền dự phòng','Chuyến đi vui làm hai người muốn có quỹ trải nghiệm đều.','Góp phần nhỏ theo kỳ','Giữ trải nghiệm gần ít tiền','bond', ['deal','bond'])]),
E('l36','Tuần trăng mật giữa tour hưu trí','{person} nhìn danh sách tour mới biết hai bạn trẻ nhất đoàn gần bốn mươi tuổi. Lịch ngủ lúc tám giờ.','adult,spouse',[
B('Theo đoàn rồi tìm giờ riêng','Có chuyện mới, ít đêm dài','Một đôi già gửi hai bạn địa chỉ nơi họ đã sống, rủ tới thăm.','Nhận chuyến thăm nhỏ','Giữ liên hệ qua thư','bond', ['bond','bond']),
B('Thương lượng đổi phần hoạt động','Có lịch hợp, tốn công làm rõ','Đoàn thích hoạt động mới, công ty tour muốn bạn góp một lịch mẫu.','Góp lịch cùng người bạn đời','Giữ kỳ nghỉ khỏi thành việc','deal', ['deal','bond']),
B('Tự tách một ngày khám phá','Có cuộc đi riêng, cần tự lo','Ngày riêng cho thấy mỗi người thích một kiểu nghỉ khác nhau.','Luân phiên chọn ngày tiếp','Lập giờ riêng trong chuyến chung','probe', ['bond','build'])]),
E('l37','Ngày sinh trùng trận chung kết','{person} nhắc lịch gia đình ngay khi bạn sắp đi xem trận đấu đã hẹn với cả nhóm.','adult,spouse,child',[
B('Ở cùng nhà, nhờ nhóm gửi tin','Có mặt, lỡ sân khấu lớn','Nhóm làm ảnh kỷ niệm gửi tới, muốn lần sau gia đình cùng tham gia.','Chọn dịp hợp cả nhà','Giữ một buổi riêng với nhóm','care', ['bond','bond']),
B('Thương lượng giờ có mặt rõ','Giữ hai cuộc, phải đúng hẹn','Một lần trễ khiến người ấy hỏi bạn ưu tiên điều gì khi lịch chạm nhau.','Cùng đặt nguyên tắc trước','Giảm bớt lịch ngoài một mùa','deal', ['bond','bond']),
B('Tổ chức xem lại sau ở nhà','Có ngày chung, đổi cuộc vui','Buổi xem lại thành lịch cả nhà, người không thích bóng đá muốn một lượt chọn khác.','Luân phiên điều mỗi người thích','Giữ bóng đá cho nhóm riêng','bond', ['bond','bond'])]),
E('l38','Bạn đời từng giật cặp bạn','{person} tìm ảnh lớp cũ, bạn nhận ra người từng giật cặp mình lại là người đang sống cùng.','adult,spouse',[
B('Kể mình nhớ gì và nghe họ kể','Có cơ hội sửa, khơi điều cũ','Hai ký ức khác nhau, nhưng người ấy muốn xin lỗi bằng việc cụ thể.','Nói rõ việc mình cần','Nhận lời xin lỗi rồi đi chậm','truth', ['truth','bond']),
B('Cùng tìm bạn cũ xác nhận','Có nhiều góc nhìn, dễ lời đồn','Bạn cũ nhớ một người khác đã giúp hai bạn làm hòa ngày ấy.','Tìm lại người từng giúp','Giữ chuyện trong hai người','probe', ['probe','bond']),
B('Đặt lại cách đùa trong nhà','Có ranh mới, bỏ thói quen cũ','Một trò đùa trong bữa họp chạm đúng ranh hai người vừa đặt.','Đứng cùng nhau nói rõ','Rời bữa để nói riêng trước','defy', ['truth','truth'])]),
E('l39','Hai bạn đời đi du lịch trước','{person} đã đặt chuyến đi với người hàng xóm, để bạn và gia đình tự thu xếp một tuần.','adult,spouse,child',[
B('Chia lại việc và giữ nhà chạy','Có trải nghiệm, thêm phần gánh','Người ấy về, hai người thấy việc thường ngày cần chia khác trước.','Lập lịch theo công thật','Thuê hỗ trợ trong khả năng','care', ['build','build']),
B('Rủ gia đình có chuyến nhỏ riêng','Có kỷ niệm mới, thêm chi','Hai chuyến về cùng lúc, mọi người muốn biết chuyến nào vui hơn.','Kể điều mỗi nhóm học được','Đặt chuyến chung lần tới','bond', ['probe','bond']),
B('Nói rõ quyền nghỉ của cả hai','Có công bằng, cần thỏa thuận','Đến lượt bạn nghỉ, người ấy muốn giúp chuẩn bị nhưng hay can thiệp lịch.','Tự chọn trong phần đã hẹn','Mời người ấy góp một phần','deal', ['defy','deal'])]),
E('l40','Cả hai lén nuôi cùng con mèo','{person} thú nhận có một chỗ ghé mỗi chiều. Bạn nhận ra đó là nơi mình cũng lén mang thức ăn tới.','adult,spouse',[
B('Cùng nhận trách nhiệm chăm','Có việc chung, thêm chi đều','Con mèo đã có chủ ở nhà cạnh, họ xin hai bạn cùng giữ lịch chăm đúng.','Phối hợp theo hướng dẫn chủ','Giữ vai người tới chơi','care', ['probe','bond']),
B('Tìm chủ và nói thật mọi việc','Rõ con mèo, vui một chuyện giấu','Người chủ rủ hai bạn tham gia nhóm chăm thú khi đi vắng.','Tham gia theo khả năng','Giữ lịch thăm riêng','truth', ['bond','bond']),
B('Biến buổi ghé thành cuộc hẹn','Có giờ chung, bớt màn bí mật','Hai bạn thích cuộc hẹn nhỏ và muốn chọn một sở thích khác để cùng thử.','Luân phiên chọn việc mới','Giữ buổi ghé như nghi thức','bond', ['bond','bond'])]),
E('l41','Mẹ có người yêu trẻ hơn bạn','{person} muốn đưa bạn mới tới ăn cơm. Bạn chuẩn bị câu hỏi như thể mình là người lớn duy nhất.','late,mother',[
B('Mời tới như một người khách','Có cơ hội hiểu, phải bỏ định kiến','Hai người muốn đi xa một mùa và nhờ bạn giữ nhà.','Bàn trách nhiệm giữ nhà rõ','Giúp tìm người giữ phù hợp','bond', ['care','probe']),
B('Hỏi mẹ cần gì ở mối quan hệ','Có tiếng nói thật, nghe điều khó','Mẹ nói muốn quyền tự quyết cả tiền và lịch sống của mình.','Tôn trọng với thông tin rõ','Đề nghị cùng kiểm kế hoạch đi','truth', ['bond','probe']),
B('Đặt ranh về phần trách nhiệm của mình','Giữ quyền hai bên, dễ bị giận','Khi cần giúp việc thực tế, mẹ hỏi bạn có giữ lời phần đã nhận không.','Làm đúng phần mình hẹn','Thương lượng lại bằng sức hiện tại','defy', ['build','deal'])]),
E('l42','Tình đầu trở lại với sổ nợ','{person} kể người xưa muốn gặp bạn. Họ mang cuốn sổ có món bạn mượn từ thời còn đi học.','old,single,friend',[
B('Trả món nợ rồi gặp như người nay','Khép cũ, có cuộc gặp mới','Người ấy muốn một chuyến đi tới nơi hai người từng hẹn mà chưa tới.','Đi theo sức và ý hiện tại','Giữ cuộc hẹn ở gần nhà','bond', ['deal','bond']),
B('Hỏi câu chuyện phía sau sổ','Có lời thật, bỏ kịch bản xưa','Người ấy giữ sổ vì trang sau là bài thơ bạn quên đã viết.','Cùng viết thêm trang hiện tại','Đổi lại kỷ vật rồi chúc nhau','probe', ['build','bond']),
B('Mời nhóm bạn cũ cùng gặp','Có ký ức chung, bớt áp lực đôi','Sau buổi họp, người ấy hỏi có thể gặp riêng bạn lần tới không.','Nhận một buổi không hứa trước','Giữ gặp theo nhóm bạn','care', ['bond','bond'])]),
E('l43','Bố hẹn hò cô giáo cũ của bạn','{person} báo sẽ mời người bạn mới tới. Bạn nhận ra chữ trên thiệp giống lời phê học bạ của mình.','late,father',[
B('Chào bằng vai người lớn hiện tại','Có gia đình mới, bỏ vai học trò','Người ấy nhờ bạn gọi bằng tên thay vì cô trong các buổi nhà.','Thử cách gọi cả hai thoải mái','Giữ cách gọi riêng được đồng ý','bond', ['bond','bond']),
B('Nói rõ điều khiến mình ngượng','Có sự thật, cần kiên nhẫn','Bố muốn biết bạn lo cho ông hay chỉ lo người khác bàn.','Bàn điều cần thu xếp thật','Xin thời gian quen dần','truth', ['bond','bond']),
B('Tổ chức một việc chung ngoài bữa ăn','Có trải nghiệm mới, cần chia vai','Cả nhà làm vườn, cô giáo cũ xin giữ một góc trồng cây riêng.','Chia vườn theo người chăm','Giữ vườn chung cùng chọn cây','care', ['deal','bond'])]),
E('l44','Cả xóm thay phiên làm mối','{person} mang thêm một địa chỉ làm quen. Bạn vừa mất bạn đời và chưa biết muốn gặp ai hay chưa.','old,widowed,neighbor',[
B('Nhận một buổi gặp không hứa trước','Có người trò chuyện, dễ bị kỳ vọng','Người ấy cũng muốn có bạn đi dạo hơn là vội cưới.','Giữ lịch đi dạo nhẹ','Nói rõ mình cần thêm khoảng riêng','bond', ['bond','truth']),
B('Xin ngừng mai mối, giữ tình xóm','Có khoảng thở, bỏ cơ hội gần','Người hàng xóm rủ bạn tới hội sách không có màn giới thiệu đôi.','Tới vì sở thích mình','Giữ giờ ở nhà yên tĩnh','defy', ['bond','bond']),
B('Mở bữa bạn bè thay xem mắt','Có cộng đồng, phải chủ động tổ chức','Bữa ăn kéo thêm người cùng cảnh, họ muốn luân phiên làm chủ nhà.','Giữ vòng bữa ăn tự nguyện','Chuyển gặp ở quán gần','care', ['bond','bond'])]),
E('l45','Thư tình bị quên tác giả','{person} tìm thấy thư tình trong tủ và bạn ghen trước khi nhận ra nét chữ mình hồi trẻ.','late,spouse',[
B('Đọc cùng và nhận mình đã quên','Có tiếng cười, chạm thời đã qua','Người ấy muốn bạn viết lá thư mới bằng điều còn thấy ở nhau hôm nay.','Viết thư không nhờ ai hộ','Kể trực tiếp điều muốn nói','truth', ['build','truth']),
B('Rủ tới nơi từng viết thư','Có chuyến chung, nơi xưa đã đổi','Chỗ cũ thành cửa hàng, chủ quán cho hai bạn ngồi lại và hỏi câu chuyện.','Kể phần hai người đồng ý','Giữ kỷ niệm chỉ cho nhau','bond', ['truth','bond']),
B('Làm hộp thư cho những năm tới','Có nghi thức mới, cần duy trì','Một năm ít chuyện, người ấy hỏi hộp thư có cần lời hay mới được bỏ vào.','Viết cả điều bình thường','Đổi sang cuộc đi bộ kể chuyện','care', ['build','truth'])]),
E('l46','Hai người già thích cùng người bán xôi','{person} thú nhận cũng đang quý người bạn hay ghé mua bữa sáng. Người bán chưa hề hứa gì với ai.','old,single,vn,friend',[
B('Mời người ấy một cuộc gặp rõ','Có câu trả lời, có thể bị từ chối','Người bán muốn gặp sau giờ nghỉ, không trong lúc đang làm việc.','Giữ lời mời ngoài giờ bán','Làm khách quen với ranh rõ','truth', ['care','build']),
B('Giữ tình bạn và để họ tự chọn','Giữ người bạn, tình chưa rõ','Người bạn được nhận lời gặp, nhưng vẫn muốn giữ bữa sáng cùng bạn.','Giữ bữa sáng như bạn bè','Tìm một nhóm sở thích mới','bond', ['bond','probe']),
B('Rủ cả nhóm đi chơi một dịp','Có dịp hiểu nhau, không ép đôi','Người bán rủ thêm bạn mình và muốn biến thành chuyến nhóm thường kỳ.','Giữ nhóm theo sức mọi người','Mời người mình quý nói riêng','care', ['deal','truth'])]),
E('l47','Cháu lập hồ sơ hẹn hò cho bạn','{person} cho xem hồ sơ có ảnh bạn trẻ hơn hai mươi tuổi. Rất nhiều lời chào đã tới.','old,single,child',[
B('Sửa ảnh và tự chọn cách dùng','Có quyền gặp, hết vai trẻ','Một người thích hồ sơ sau khi sửa muốn gọi chuyện trước khi gặp.','Gọi để hiểu người hiện tại','Giữ nhắn thư trước đã','truth', ['bond','bond']),
B('Xóa hồ sơ, nhờ giới thiệu ngoài đời','Giữ riêng tư, ít người gặp hơn','Người thân mời bạn tới hội cây cảnh có người cùng sở thích.','Tới hội vì thích cây','Giữ lịch riêng mình muốn','exit', ['bond','bond']),
B('Nhờ dạy cách tự dùng rồi quyết','Có kỹ năng, cần kiên nhẫn','Bạn quen một nhóm bạn đọc xa, một người muốn trao thư thật.','Trao thư với giới hạn rõ','Giữ nhóm đọc chung','probe', ['exit','bond'])]),
E('l48','Món ăn cả đời giả vờ thích','{person} nói không chịu nổi món bạn vẫn gọi suốt nhiều năm. Bạn cũng chỉ gọi vì tưởng người ấy thích.','late,spouse',[
B('Cùng thú nhận những điều nhỏ khác','Có đời thật, hụt thói quen','Hai người phát hiện mỗi người muốn một kiểu nghỉ khác nhau.','Luân phiên chọn kỳ nghỉ','Chia giờ riêng trong chuyến chung','truth', ['bond','deal']),
B('Mỗi tuần thử món một người chọn','Có khám phá, phải nhường lượt','Một món mới thành món chung, quán sắp đóng vì chủ chuyển đi.','Cùng học cách nấu lại','Giữ một bữa cuối ở quán','bond', ['probe','bond']),
B('Tự nấu món đầu chưa ai biết thích','Có việc cùng, dễ thất bại vui','Món nấu hỏng được cả nhà nhớ, con cháu muốn giữ buổi bếp hằng tháng.','Giữ buổi nấu ai cũng góp','Giữ bếp riêng cho hai người','build', ['bond','bond'])]),
E('l49','Con cấm bạn hẹn ở tuổi già','{person} lo bạn gặp người mới trong nhóm sinh hoạt. Cuộc hẹn chỉ là một buổi trà chiều.','old,single,child',[
B('Nói quyền tự quyết và nghe nỗi lo','Có ranh, cần thông tin rõ','Con muốn gặp người ấy để bớt lo, nhưng bạn không muốn thành buổi xét hỏi.','Gặp như khách bình thường','Giữ chuyện hẹn riêng của mình','defy', ['bond','bond']),
B('Giới thiệu từ một hoạt động chung','Có dịp hiểu, chậm cuộc hẹn','Hoạt động suôn sẻ, người ấy hỏi hai người có thể có thời gian riêng chưa.','Đặt cuộc hẹn tự chọn','Giữ tình bạn theo nhóm','bond', ['defy','bond']),
B('Giữ tiền riêng và lịch liên hệ rõ','Có an tâm, bớt phần tự phát','Con bớt lo, nhưng bắt đầu hỏi lịch quá chi tiết mỗi ngày.','Thu gọn thông tin đã hẹn','Nói lại giới hạn riêng tư','deal', ['exit','exit'])]),
E('l50','Hai người cùng giữ một lời hẹn','{person} đưa bạn hai thư cũ: hai người khác nhau đều tin bạn sẽ tới gặp vào cùng một ngày.','old,single,friend',[
B('Nói rõ với từng người trước ngày hẹn','Có lòng thật, có thể hụt cả hai','Một người vẫn muốn gặp để khép câu chuyện, người kia muốn bắt đầu lại.','Tự chọn bằng điều mình muốn nay','Giữ cả hai ở tình bạn rõ ràng','truth', ['defy','bond']),
B('Xin đổi thành hai cuộc gặp khác ngày','Có thời gian, phải rõ mục đích','Hai cuộc gặp cho thấy bạn đang nhớ hai phiên bản khác nhau của chính mình.','Chọn quan hệ hợp đời hiện tại','Khép chuyện cũ bằng thư riêng','probe', ['bond','exit']),
B('Mời nhóm bạn cũ cùng trở lại nơi hẹn','Có ký ức chung, bớt lời hứa đôi','Buổi gặp vui, một người xin bạn một câu trả lời không nằm trong ảnh tập thể.','Nói riêng câu trả lời thật','Giữ ranh giới đã chọn','bond', ['truth','exit'])]),
];
