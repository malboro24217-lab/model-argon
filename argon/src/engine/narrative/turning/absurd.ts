import { E, B, type Fork } from './kit.ts';
export const ABSURD: Fork[] = [
E('a01','Con dê ăn sổ đỏ','{person} dắt con dê đang nhai góc giấy cuối cùng. Ngày mai bạn có hẹn giải quyết giấy tờ đất.','adult,vn,land,neighbor',[
B('Xin cấp lại bằng hồ sơ thật','Mất thời gian, rõ giấy tờ','Hồ sơ được tìm lại, nhưng diện tích ghi lệch đúng chỗ chuồng dê.','Đo lại ranh hai nhà','Xin bản đối chiếu độc lập','probe', ['bond','probe']),
B('Nhờ chủ dê cùng giải quyết','Có đồng minh, phải giữ hòa','Chủ dê muốn đền bằng cả đàn dê con. Nhà bạn chưa có chuồng.','Góp đàn vào trại chung','Đổi đàn dê thành công sửa rào','deal', ['deal','build']),
B('Kể chuyện dê để tìm nhân chứng','Có người nhớ, nổi tiếng bất đắc dĩ','Một người còn giữ ảnh giấy tờ; người khác xin quay phim về con dê.','Nhận quay để trả phí hồ sơ','Giữ ảnh rồi khép chuyện','show', ['deal','exit'])]),
E('a02','Thừa kế ba trăm con vịt','{person} giao đàn vịt cùng cuốn sổ của người chú. Con đầu đàn có đeo một chiếc chuông.','adult,money,neighbor',[
B('Nhận nuôi đàn vịt','Có nghiệp riêng, thức từ sáng','Một quán đặt trứng dài hạn, nhưng yêu cầu giao trước khi trời sáng.','Rủ người cùng chia ca','Giữ đàn nhỏ bán tại nhà','build', ['deal','deal']),
B('Bán đàn, giữ con có chuông','Có vốn, giữ một kỷ niệm','Người mua muốn thuê bạn dẫn đàn qua kênh mỗi mùa.','Nhận dẫn theo hợp đồng','Giới thiệu người chăm đàn mới','deal', ['deal','care']),
B('Góp đàn cho tổ nuôi chung','Có người cùng nuôi, chia quyền','Đàn tăng nhanh, cả tổ tranh nhau đặt tên thương hiệu. Con chuông thành linh vật.','Cho tổ bầu tên chung','Giữ tên chú trên chuồng gốc','bond', ['bond','bond'])]),
E('a03','Bạn già hơn trên giấy','{person} đưa thẻ căn cước mới: năm sinh khiến bạn già thêm mười tuổi. Ảnh lại trẻ hơn thật.','adult,vn,official',[
B('Đi sửa ngay','Rõ tuổi, lạc trong hồ sơ','Hồ sơ tìm được người trùng tên. Người ấy cũng đang đi sửa tuổi.','Cùng đối chiếu hai bộ giấy','Nhờ người độc lập xác nhận','probe', ['probe','build']),
B('Xin văn bản xác nhận tạm','Giữ việc, còn chuyện dang dở','Văn bản tạm hết hạn đúng lúc bạn được mời dự hội người cao tuổi.','Tới hội để nhờ tìm hồ sơ','Tập trung hoàn tất giấy mới','deal', ['probe','bond']),
B('Kể chuyện tuổi để gọi người giúp','Có người biết, ai cũng trêu','Hội người cao tuổi mời bạn dạy cách dùng điện thoại vì trẻ nhất hội.','Nhận lớp sau khi sửa giấy','Giúp tìm người dạy lâu dài','show', ['build','probe'])]),
E('a04','Nhầm quan tài, đúng người quen','{person} phát hiện nhà đòn giao nhầm quan tài trống dùng để trưng bày. Buổi lễ chưa bắt đầu.','adult,neighbor',[
B('Giúp đổi lại trong im lặng','Giữ buổi lễ, có người mang ơn','Gia đình xin bạn điều phối một quỹ hậu sự cho xóm.','Lập quỹ có sổ rõ','Chỉ giúp một lần mỗi nhà','care', ['care','care']),
B('Yêu cầu nhà đòn giải thích công khai','Rõ trách nhiệm, buổi lễ bị gián đoạn','Nhà đòn muốn thuê bạn kiểm lại quy trình giao nhận.','Nhận kiểm quy trình theo đợt','Đề nghị người có nghề tiếp quản','truth', ['probe','bond']),
B('Rủ xóm lo phần nghi lễ còn lại','Có người chung sức, dễ hỗn loạn','Đội lễ làm tốt đến mức xóm bên nhờ giúp, mỗi người mang một kịch bản.','Lập đội có người dẫn','Giữ đội chỉ giúp người quen','bond', ['build','care'])]),
E('a05','Clip rơi xuống ao','{person} quay đúng lúc bạn ôm ghế ngã xuống ao. Clip nổi hơn mọi việc bạn từng làm.','adult,friend',[
B('Tự kể tiếp câu chuyện','Có khán giả, mất riêng tư','Một nơi bán ghế mời bạn diễn lại cú ngã. Họ đem cả bể nước.','Đàm phán màn diễn an toàn','Làm clip về nghề thật của mình','show', ['deal','build']),
B('Dùng lượt xem cho việc chung','Có người nghe, chịu kỳ vọng','Quỹ sửa cầu đủ tiền. Mọi người muốn bạn nhảy ao lần nữa cho quỹ sau.','Chuyển sang sự kiện khác','Giao quỹ cho nhóm công khai','care', ['bond','truth']),
B('Xin gỡ clip, giữ bản riêng','Giữ mình, bỏ lượt xem','Một người tìm tới vì nhận ra tiếng cười của người thân trong clip.','Giúp họ tìm bản ghi gốc','Chỉ chia phần đã xin phép','exit', ['probe','deal'])]),
E('a06','Ban nhạc nhận nhầm khách','Bạn vừa bước vào tiệc, ban nhạc hô tên bạn là chủ lễ. {person} đã cầm sẵn micro.','adult,friend',[
B('Dẫn giúp một tiết mục','Có sân khấu, dễ lỡ lời','Chủ tiệc mời bạn dẫn thêm một đám. Tờ kịch bản dài hơn thực đơn.','Tập làm người dẫn','Chỉ nhận phần kể chuyện nhỏ','show', ['build','truth']),
B('Tìm đúng người rồi giới thiệu','Giải nhầm, có người biết ơn','Người dẫn thật rủ bạn làm hậu trường, nơi mọi món đồ đều đang thất lạc.','Nhận điều phối một buổi','Giúp dựng danh sách kiểm đồ','build', ['build','probe']),
B('Biến nhầm lẫn thành trò chơi','Có tiếng cười, kéo cả bàn vào','Khách muốn mỗi tiệc có một màn đoán người dẫn. Bạn được nhờ viết luật.','Viết trò chơi có người tự nguyện','Dừng ở kỷ niệm một tiệc','bond', ['show','exit'])]),
E('a07','Một năm nước mắm','{person} báo bạn trúng thưởng một năm nước mắm. Xe giao đến đủ chai để chặn cửa nhà.','adult,vn,neighbor',[
B('Mở quầy bán số dư','Có việc nhỏ, đầy mùi cá','Khách muốn mua cả món ăn dùng loại mắm ấy. Gian bếp thành nơi thử nghề.','Thử bán món theo đơn','Giữ quầy bán chai thôi','build', ['deal','deal']),
B('Chia mỗi nhà một ít','Có người nhớ, hết chỗ kho','Cả xóm mang đồ ăn sang trả lễ cùng một tối. Bàn nhà chỉ đủ chỗ cho sáu người.','Biến thành bữa ăn chung','Lập lịch đổi món từng tuần','bond', ['bond','build']),
B('Đổi mắm lấy thứ đang cần','Có mạng đổi hàng, khó tính phần','Người đổi tặng bạn phiếu mua gạo, đổi tiếp được một chiếc tủ cũ.','Giữ sổ đổi hàng của xóm','Dừng ở món mình cần','deal', ['bond','exit'])]),
E('a08','Hai trăm chiếc bồn cầu','{person} giúp nhận hộ lô hàng. Khi mở kho, hai trăm chiếc bồn cầu nhìn lại bạn.','adult,neighbor',[
B('Tìm người mua thật của lô hàng','Có đầu mối, tốn công trả','Chủ hàng mời bạn quản lý giao nhận vì đã kiểm đủ từng chiếc.','Thử làm một chuyến hàng','Chỉ nhận khoản bù công','probe', ['build','bond']),
B('Xin mua lại số hàng tồn hợp lệ','Có kho để bán, cần vốn','Một đội xây dựng đặt cả lô nhưng muốn thanh toán theo tiến độ.','Chia lô giao theo tiền','Tìm khách trả từng món','build', ['deal','probe']),
B('Mượn hàng dựng triển lãm tạm','Có tiếng vang, phải xin phép','Triển lãm được chú ý, chủ hàng muốn biến nó thành gian trưng bày thật.','Nhận thiết kế có hợp đồng','Trả hàng giữ ảnh kỷ niệm','show', ['deal','bond'])]),
E('a09','Giải thưởng là một con bò','{person} cầm giấy chứng nhận khách hàng thứ một triệu. Con bò giải thưởng đã buộc cạnh cửa hàng.','adult,friend',[
B('Nhờ trại nuôi rồi chia lợi','Có phần thu, phụ thuộc người chăm','Trại muốn bạn góp thêm phần vốn cho đàn mới, trong khi phần lợi mùa trước chưa chia.','Kiểm sổ trước khi góp','Giữ đúng một phần bò','deal', ['probe','bond']),
B('Đổi giải lấy dụng cụ nghề','Có thứ dùng, mất linh vật','Cửa hàng muốn chụp bạn với dụng cụ mới để kể câu chuyện đổi giải.','Kể thật cách mình dùng','Xin giữ chuyện riêng','build', ['truth','bond']),
B('Tặng bò cho bếp cộng đồng','Có người được giúp, mang tiếng lớn','Bếp đặt tên buổi gây quỹ theo tên bạn và muốn bạn đứng ra tổ chức.','Nhận một buổi minh bạch','Để bếp tự giữ câu chuyện','care', ['truth','bond'])]),
E('a10','Họp nhầm gia đình','{person} gửi sai địa chỉ. Bạn ăn hết bữa mới biết đây là cuộc họp chia di sản của người lạ.','adult,friend',[
B('Thú nhận rồi giúp ghi biên bản','Mất mặt, được tin vì vô can','Gia đình mời bạn làm người chứng kiến khi giao kỷ vật.','Giúp phần đã tận mắt thấy','Giới thiệu người có chuyên môn','truth', ['care','bond']),
B('Xin phép về, để lại món quà','Giữ ranh, có câu chuyện lạ','Một người trong bữa ăn tìm tới, muốn trả lại món quà kèm lời mời kết bạn.','Nhận một cuộc gặp ngoài','Giữ lời chào qua thư','exit', ['bond','care']),
B('Mời họ một bữa trả lễ','Có bạn mới, thêm lịch ăn','Hai gia đình cùng tới và tưởng đã quen nhau từ nhiều năm.','Tổ chức buổi giới thiệu thật','Chuyển thành bữa mở cho xóm','bond', ['build','build'])]),
E('a11','Con vẹt biết mật khẩu cửa','{person} mang con vẹt tới xin ở nhờ. Nó nhại đúng câu bạn dùng để mở cửa điện tử.','adult,home,neighbor',[
B('Đổi mã rồi nhận trông vẹt','Giữ an toàn, có bạn ồn','Con vẹt học cả tiếng chuông khách. Xóm nhờ nó báo lúc giao hàng.','Nhận trông theo giờ rõ','Trả vẹt với sổ hướng dẫn','care', ['bond','probe']),
B('Nhờ chủ tìm nơi nuôi phù hợp','Giữ yên nhà, hụt trò vui','Chủ vẹt mở quán nhỏ, mời bạn đặt tên vì câu cửa miệng nổi tiếng.','Góp ý cho quán','Giữ tên mình khỏi biển hiệu','exit', ['deal','bond']),
B('Quay màn đối đáp có xin phép','Có khán giả, chia công với chim','Khán giả muốn xem trực tiếp, chủ vẹt đề nghị mở buổi gây quỹ.','Tổ chức buổi nhỏ đủ nghỉ','Chỉ làm bản ghi thỉnh thoảng','show', ['build','build'])]),
E('a12','Cây chuối được bầu đại diện','{person} đặt tên cây chuối của bạn lên phiếu đùa. Nó nhận nhiều phiếu hơn mọi ứng viên thật.','adult,vn,neighbor',[
B('Dùng tiếng cười mở cuộc họp thật','Có người nghe, phải làm được','Xóm giao bạn kiểm khoản mua cây chung. Có người đòi tính cả cây chuối.','Mở sổ và bỏ phiếu lại','Chuyển việc cho nhóm ba hộ','defy', ['truth','bond']),
B('Làm lễ trao chức cho cây','Có trò vui, nổi danh xóm','Lễ thành ngày hội nhỏ. Người ta muốn bán vé xem cây phát biểu.','Giữ hội tự nguyện','Đổi thành buổi diễn gây quỹ','show', ['bond','show']),
B('Xin bầu lại người tự nguyện','Rõ trách nhiệm, bớt tiếng cười','Người thắng thật nhờ bạn làm người phản biện vì không nợ phe nào.','Nhận phản biện công khai','Giữ vai người dân góp ý','truth', ['truth','deal'])]),
E('a13','Giải chạy không ai chịu về đích','{person} nói giải thưởng là chăm sân vận động một tháng. Người dẫn đầu đang chạy chậm lại.','adult,friend',[
B('Chạy về đích và nhận việc','Có danh, có sân phải chăm','Sân sạch lên, trẻ trong khu xin bạn lập đội tập.','Lập đội theo lịch nhỏ','Giao sân cho nhóm phụ huynh','care', ['build','bond']),
B('Rủ cả đoàn về đích cùng','Chia giải, phải chia ca','Ban tổ chức yêu cầu cả nhóm thống nhất một người nhận cúp.','Luân phiên giữ cúp','Để cúp ở nhà cộng đồng','bond', ['bond','bond']),
B('Thương lượng đổi phần thưởng','Đổi luật, dễ bị phản đối','Giải sau mời bạn thiết kế phần thưởng, ngân sách chỉ đủ một chiếc chổi.','Tìm tài trợ công khai','Làm giải đổi công lấy vui','deal', ['probe','build'])]),
E('a14','Hồ sơ xin nghỉ của cái máy','{person} đọc đơn xin nghỉ được in từ máy cũ. Ai đó đã ký thay máy bằng dấu vân tay dầu.','adult,job,boss',[
B('Sửa máy và giữ tờ đơn','Giữ sản xuất, thành người cứu máy','Máy chạy lại, xưởng muốn bạn nhận bảo dưỡng tất cả thiết bị.','Học bảo dưỡng có chứng chỉ','Chỉ nhận dòng máy mình biết','build', ['probe','bond']),
B('Diễn buổi chia tay cho máy','Có tiếng cười, lộ tuổi máy','Buổi chia tay giúp thuyết phục mua máy mới; nhóm xin giữ vỏ cũ làm bàn.','Dựng góc lịch sử xưởng','Biến vỏ thành bàn học nghề','show', ['build','probe']),
B('Dùng đơn để đòi kiểm an toàn','Có căn cứ, dừng một ca','Kiểm tra tìm ra vấn đề thật. Nhóm muốn bạn phụ trách kiểm định nội bộ.','Nhận với đào tạo rõ','Đề nghị chuyên gia phụ trách','probe', ['build','bond'])]),
E('a15','Đồng phục cưới bị giao nhầm','{person} mở thùng áo cho hội diễn. Bên trong toàn khăn và áo của một đội tang lễ.','adult,friend',[
B('Đổi lại trước giờ diễn','Giữ tiết mục, chạy khắp phố','Bên giao nhầm nhờ bạn tổ chức lại kho trang phục.','Nhận dựng hệ thống nhãn','Chỉ giới thiệu người kiểm kho','build', ['build','probe']),
B('Đổi tiết mục cho hợp trang phục','Có bản diễn lạ, cần đồng thuận','Tiết mục thành công, đoàn muốn diễn tiếp nhưng một người không thấy vui.','Viết lại cùng cả đoàn','Giữ buổi đầu làm kỷ niệm','show', ['build','build']),
B('Mượn đồ khán giả dựng sân khấu','Có người cùng chơi, khó trả đồ','Khách xin mở hội đổi trang phục hằng năm vì đã quen nhau lúc cho mượn.','Lập hội có sổ mượn trả','Giúp buổi đầu rồi bàn giao','bond', ['build','care'])]),
E('a16','Mèo chiếm ghế chủ tọa','{person} mở họp khu phố. Con mèo của bạn ngủ giữa chồng biên bản và không chịu xuống.','adult,neighbor',[
B('Dời họp ra sân','Có không khí mới, thiếu bàn','Họp sân dễ nói chuyện hơn. Xóm muốn dùng sân bạn mỗi tháng.','Cho mượn theo lịch rõ','Tìm một sân dùng chung','bond', ['bond','probe']),
B('Lấy mèo làm biểu tượng quỹ','Có sức hút, dễ thành trò quá đà','Quỹ ghế công cộng đủ tiền. Người góp muốn con mèo ký biên nhận.','Đọc sổ quỹ thay màn diễn','Tổ chức buổi trao ghế vui','show', ['care','build']),
B('Nhường ghế, kiểm biên bản riêng','Giữ việc thật, bỏ trung tâm','Biên bản lộ một khoản cộng sai. Người ghi sổ nhờ bạn cùng sửa trước họp tới.','Kiểm chéo toàn bộ khoản','Hướng dẫn cách cộng đối chiếu','probe', ['probe','probe'])]),
E('a17','Bản đồ kho báu là sơ đồ ống nước','{person} tìm được bản đồ ông để lại. Dấu X nằm chính xác dưới nhà vệ sinh mới xây.','adult,home,sibling',[
B('Nhờ thợ kiểm trước khi đào','Có căn cứ, mất vẻ huyền bí','Thợ tìm được hộp thư chống nước cạnh đường ống cũ.','Tìm người nhận lá thư','Giao hộp cho gia đình giữ','probe', ['probe','bond']),
B('Biến cuộc tìm thành ngày họp nhà','Có chuyện chung, chưa có kho báu','Mỗi người mang một kỷ vật tới, ai cũng nghĩ mình có chìa khóa thật.','Lập tủ ký ức chung','Chụp lại rồi trả từng người','bond', ['deal','bond']),
B('Dùng bản đồ sửa hệ thống nước','Có nhà tốt hơn, khép giấc vàng','Đường ống sửa xong giúp cả hai nhà; hàng xóm muốn cùng trả công.','Chia phí bằng sổ rõ','Đổi phần công lấy giúp việc khác','build', ['deal','care'])]),
E('a18','Giấy mời cho hai người cùng tên','{person} đưa giấy mời nhận giải. Tới nơi bạn thấy người cùng tên đã ngồi hàng đầu.','adult,friend',[
B('Cùng đứng lên giải thích','Rõ người, thành cặp nổi tiếng','Ban tổ chức mời hai bạn làm chung một tiết mục giới thiệu nghề.','Nhận tiết mục đôi','Chỉ nhận thư đính chính','truth', ['show','truth']),
B('Làm khách của người được giải','Có bạn mới, lùi hào quang','Người cùng tên giới thiệu bạn với khách đang cần đúng tay nghề mình.','Nhận một việc thử','Giữ quan hệ không gắn lợi ích','bond', ['bond','bond']),
B('Phỏng vấn nhau ngay tại tiệc','Có câu chuyện lạ, lộ chuyện riêng','Bài phỏng vấn được xin đăng, cả hai muốn cắt những đoạn khác nhau.','Biên tập theo đồng thuận','Giữ bản riêng cho nhau','show', ['bond','bond'])]),
E('a19','Sân nhà thành điểm giao hàng','{person} nhờ nhận một kiện. Bản đồ giao hàng từ đó coi sân bạn là trung tâm phân phối.','adult,home,neighbor',[
B('Xin mở điểm nhận hàng thật','Có nghề tại nhà, hết sân trống','Người giao đề nghị ca tối vì lượng hàng tăng. Gia đình muốn giữ giờ ăn.','Giới hạn giờ nhận rõ','Thuê chỗ riêng cho quầy','build', ['exit','build']),
B('Yêu cầu sửa địa chỉ','Giữ sân, mất tiện nhận hộ','Sau khi sửa, người già trong khu nhờ bạn giữ một kệ nhận thuốc.','Giữ kệ nhỏ theo lịch','Nhờ cửa hàng gần đó nhận giúp','exit', ['bond','care']),
B('Rủ vài nhà chia điểm nhận','Chia việc, cần tin nhau','Một kiện giá trị bị giao thiếu. Nhóm phải chứng minh ai đã nhận ca.','Đối chiếu sổ giao ca','Thu gọn về điểm có người trực','deal', ['probe','exit'])]),
E('a20','Cúp người ăn cay thuộc về bạn','{person} lỡ đăng ký tên bạn. Người dự thật cùng tên bỏ cuộc ngay trước vòng cuối.','adult,friend',[
B('Đính chính nhưng nhận kể chuyện','Giữ sức, có sân khấu','Ban tổ chức mời bạn dẫn giải năm sau vì màn đính chính quá vui.','Nhận dẫn có kịch bản','Đề nghị người thi thật dẫn','truth', ['bond','bond']),
B('Tặng cúp cho quán quen','Có chuyện quảng bá, nợ chủ quán','Quán đặt món mang tên bạn, cay tới mức bạn không dám thử.','Cùng sửa thành món ăn được','Xin bỏ tên giữ câu chuyện','show', ['build','bond']),
B('Tổ chức bữa không thi thố','Có người cùng ăn, tự bỏ danh','Người từng tranh cúp xin giúp bạn làm bữa gây quỹ.','Mở bữa gây quỹ có sổ','Giữ bữa như cuộc gặp bạn bè','bond', ['care','bond'])]),
E('a21','Chiếc loa đọc thư nhầm','{person} thử loa khu phố bằng thư bạn gửi hỏi tiền thuê nhà. Cả xóm nghe rõ khoản còn thiếu.','adult,vn,neighbor',[
B('Nói rõ và xin sửa lỗi','Giữ tiếng mình, chịu ngượng','Chủ nhà muốn thương lượng lại vì nghe bạn thật sự định chuyển đi.','Đàm phán bằng điều đã nói','Tìm nhà mới có lịch rõ','truth', ['deal','probe']),
B('Biến thành buổi hỏi đáp thuê nhà','Có người chung cảnh, thêm trách nhiệm','Nhóm thuê nhà muốn lập sổ phòng trống và nhờ bạn quản.','Lập sổ kiểm chứng thông tin','Chỉ hướng dẫn buổi đầu','defy', ['probe','probe']),
B('Đùa lại rồi gặp chủ riêng','Có tiếng cười, việc vẫn phải giải','Chủ nhà xin bạn viết lời thông báo cho khu vì ai cũng chịu nghe.','Nhận viết có giờ công','Giúp một mẫu rồi dừng','show', ['build','exit'])]),
E('a22','Bánh sinh nhật ghi tên đối thủ','{person} giao bánh đúng ngày bạn muốn làm lành với người từng ghét mình. Trên bánh là tên người ấy.','adult,rival',[
B('Mời đối thủ tới ăn cùng','Có dịp hòa, chưa chắc tới','Người ấy tới thật, rủ bạn cùng tham dự cuộc thi có giải chung.','Thi đôi với luật rõ','Giữ bữa ăn là điểm dừng','bond', ['bond','exit']),
B('Đổi bánh và giữ hóa đơn','Giữ ngày riêng, có manh mối','Tiệm bánh xin bạn thử dòng bánh mới để bù lỗi.','Nhận thử cùng người thân','Đổi khoản bù lấy bánh cho xóm','deal', ['bond','bond']),
B('Cắt bánh chia cả khu','Có cuộc vui, khỏi giải thích riêng','Ai cũng muốn tổ chức sinh nhật tập thể, đối thủ xin phụ trách âm thanh.','Chia vai ngay từ đầu','Tổ chức nhóm nhỏ trước','show', ['deal','build'])]),
E('a23','Thiệp mời từ hội ngủ trưa','{person} bầu bạn làm chủ tịch vì bạn vắng cả ba buổi họp. Hội chưa từng họp đúng giờ.','adult,friend',[
B('Nhận chức, bỏ bớt họp','Có quyền đổi nếp, chịu trêu','Hội thành nơi đổi ca trông trẻ để mọi người có giờ nghỉ.','Giữ nhóm nghỉ tương trợ','Thu về buổi gặp thảnh thơi','care', ['bond','bond']),
B('Tới họp để từ chức','Giữ thời gian, gặp bạn lạ','Không ai đủ tỉnh để ký biên bản. Một người đề nghị đi uống trà nói chuyện nghề.','Nhận cuộc hẹn trà','Gửi thư từ chức rồi về','exit', ['bond','bond']),
B('Mở ngày hội nghỉ ngơi','Có người hưởng ứng, cần tổ chức','Nơi làm việc mời bạn giúp thiết kế giờ nghỉ thực tế.','Thử chương trình một tháng','Chỉ chia sẻ kinh nghiệm hội','build', ['bond','deal'])]),
E('a24','Bưu kiện có chiếc ghế ngai','{person} nhờ nhận đồ cũ. Kiện hàng là một chiếc ngai sân khấu, vừa kín cửa phòng khách.','adult,home,friend',[
B('Cho đoàn diễn thuê ghế','Có món sinh lời, chiếm chỗ','Đoàn muốn thuê luôn sân nhà làm nơi tập. Giờ họ thích lại đúng giờ cả nhà ăn tối.','Cho tập giờ cố định','Chỉ cho thuê đồ tại kho','deal', ['bond','build']),
B('Mở buổi chụp ảnh gây quỹ','Có tiếng cười, nhà đông khách','Có người mang cả áo choàng tới và xin làm hội diễn thường kỳ.','Dựng buổi diễn tự nguyện','Dừng sau khoản quỹ đầu','show', ['show','exit']),
B('Trả ghế và xin đổi lấy bàn','Có đồ dùng, bỏ danh vua','Chiếc bàn đổi được có ngăn chứa bản thảo của đoàn cũ.','Tìm người viết bản thảo','Giao lại bản thảo cho đoàn','probe', ['probe','bond'])]),
E('a25','Nhân chứng là một con chó','{person} quả quyết chó của bạn đã thấy ai lấy giỏ trái cây. Con chó chỉ muốn đi dạo.','adult,neighbor',[
B('Tìm dấu vết thật thay đoán','Giải oan, tốn buổi chiều','Giỏ được tìm ở nhà người nhận nhầm. Họ xin góp trái cho buổi họp xóm.','Nhận lời xin lỗi bằng bữa chung','Khép việc sau khi trả giỏ','probe', ['bond','exit']),
B('Dắt chó đi từng nhà hỏi','Có mạng quen mới, dễ lời đồn','Một người đề nghị trả công bạn dắt cả đàn chó của khu.','Thử dịch vụ theo giờ','Giữ một nhóm đi dạo miễn phí','build', ['bond','bond']),
B('Rủ làm giỏ trái cây chung','Hết tranh phần, cần người chăm','Giỏ chung được dùng nhiều, nhưng có người chỉ lấy không góp.','Đặt lệ theo khả năng mỗi nhà','Thu nhỏ giỏ cho nhóm tự nguyện','bond', ['defy','bond'])]),
E('a26','Karaoke gọi tên sai nghề','{person} giới thiệu bạn là ca sĩ nghỉ hưu. Khán giả đưa bài yêu cầu và phong bì.','adult,friend',[
B('Hát thật rồi nói rõ','Có sân khấu, dễ hụt nốt','Chủ quán muốn bạn làm một đêm nhạc kể chuyện người thường.','Tập một đêm có nhóm đệm','Giữ một bài vui mỗi tháng','show', ['bond','bond']),
B('Xin làm người dẫn thay ca sĩ','Đổi vai, giữ cuộc vui','Một nhóm nhạc nhờ bạn giới thiệu họ ở sự kiện lớn hơn.','Nhận dẫn và chia công','Giới thiệu người dẫn chuyên nghiệp','build', ['deal','bond']),
B('Mời cả bàn hát chung','Chia ngượng, có nhóm mới','Cả bàn lập nhóm hát, rồi tranh ai được hát câu cuối.','Luân phiên chọn bài','Chuyển sang buổi hát không sân khấu','bond', ['bond','show'])]),
E('a27','Đơn đặt hàng một nghìn cái nắp','{person} nói chỉ cần làm nắp, không cần biết đậy thứ gì. Mẫu đo lại là nắp ấm cũ của nhà bạn.','adult,job,partner',[
B('Xin mẫu và hợp đồng rõ','Có đơn thật, chậm ký','Khách giải thích đang phục chế một bộ sưu tập, muốn bạn làm thêm vật khác.','Nhận một dòng phục chế','Chỉ giữ việc nắp đã biết','probe', ['bond','exit']),
B('Làm thử một mẻ nhỏ','Có tay nghề mới, tốn công mẫu','Mẻ thử đẹp nhưng không khớp chiếc nào. Khách muốn bán như đồ trang trí.','Chuyển thành bộ trang trí','Làm lại theo khuôn đã xác minh','build', ['bond','probe']),
B('Rủ đối tác bán bộ tự làm','Tạo nghề riêng, chưa có khách','Bộ đầu có người mua làm quà cho lớp học nghề.','Mở lớp đi kèm bộ dụng cụ','Giữ bán từng bộ nhỏ','deal', ['build','deal'])]),
E('a28','Đài báo bạn mất tích','{person} nghe bản tin tìm người có tên và áo giống bạn. Bạn đang đứng mua rau cạnh chiếc loa.','adult,neighbor',[
B('Liên hệ đính chính ngay','Giữ danh tính, giúp người thật','Gia đình người mất tích nhờ bạn chia thông tin đã xác minh.','Giúp tìm trong khu mình biết','Bàn giao đầu mối cho gia đình','truth', ['probe','bond']),
B('Giúp tìm người cùng tên','Có mục đích, bỏ lịch riêng','Người ấy được tìm thấy, mời bạn gặp vì hai người giống nhau cả nghề.','Gặp để trao đổi công việc','Giữ liên hệ bạn cùng tên','care', ['bond','bond']),
B('Nhờ đài cho nói một phút','Có người nghe, chịu chú ý','Đài mời bạn kể chuyện khu phố thường kỳ, nhưng yêu cầu có chuyện mới vào mỗi sáng thứ hai.','Thử một số kể chuyện','Giới thiệu người có nhiều chuyện hơn','show', ['truth','bond'])]),
E('a29','Tổ bảo vệ tuyển nhầm diễn viên','{person} tưởng bộ đồ diễn của bạn là đồng phục. Bạn được xếp trực một buổi hội chợ.','adult,friend',[
B('Nói rõ rồi giúp chỉ đường','Giữ lễ hội, có vai mới','Ban tổ chức muốn bạn thiết kế vai nhân vật chỉ đường cho trẻ.','Làm vai có lịch nghỉ','Viết kịch bản cho người khác','show', ['build','build']),
B('Nhận việc bảo vệ sau khi xác minh','Đổi nghề, bỏ ngộ nhận','Đội muốn bạn hướng dẫn giao tiếp vì người dự ai cũng chịu hỏi bạn.','Học rồi dạy cả đội','Giữ vị trí trực mình quen','build', ['probe','bond']),
B('Dẫn người phụ trách thật tới','Rõ vai, thêm một người quen','Người phụ trách giới thiệu bạn với đoàn diễn đang thiếu người hậu trường.','Nhận một buổi thử việc','Chỉ giữ mối giới thiệu','truth', ['build','exit'])]),
E('a30','Buổi đấu giá bán cả người dẫn','{person} giơ bảng nhầm lúc bạn giới thiệu một giờ phụ giúp việc nhà. Người mua tưởng được cả ngày.','adult,friend',[
B('Thương lượng lại giờ công','Giữ ranh, có việc mới','Người mua muốn thuê bạn điều phối việc nhà cho một nhóm người già.','Nhận việc theo giờ rõ','Giới thiệu nhóm hỗ trợ phù hợp','deal', ['bond','bond']),
B('Rủ nhóm bạn chia ngày giúp','Giữ lời, kéo người vào','Nhóm giúp xong, chủ nhà xin mở một mạng đổi công.','Lập sổ giờ trao đổi','Giữ nhóm giúp theo dịp','bond', ['build','care']),
B('Hoàn tiền, tự tặng một việc','Giữ chủ động, giảm quỹ','Việc bạn tự chọn giúp ích rõ, buổi đấu giá sau mời bạn thiết kế hạng mục.','Lập hạng mục ghi rõ công','Chỉ góp vật dụng lần sau','defy', ['build','deal'])]),
E('a31','Căn nhà được gọi là di tích','{person} chỉ tấm biển mới: nhà bạn bị nhầm là nơi một nhân vật hư cấu từng ở. Khách đang chụp cửa.','adult,home,neighbor',[
B('Yêu cầu sửa biển, kể lịch sử thật','Giữ nhà, có câu chuyện riêng','Khách muốn nghe lịch sử khu phố thật thay vì tích giả.','Mở buổi kể được xin phép','Đưa tài liệu cho thư viện','truth', ['truth','probe']),
B('Mở sân uống nước có giờ','Có thu, mất riêng tư','Khách quen muốn thuê sân cho đêm kể chuyện. Hàng xóm muốn tiếng loa tắt trước giờ ngủ.','Nhận tối theo lịch nhà','Tìm địa điểm riêng cho nhóm','build', ['bond','probe']),
B('Dựng sân khấu giả tưởng ngoài cổng','Giữ trò vui, phải nói rõ hư cấu','Trẻ trong khu viết tiếp câu chuyện và muốn diễn trước nhà.','Giúp diễn một buổi','Chuyển sân khấu sang sân chung','show', ['care','show'])]),
E('a32','Con rùa thắng cuộc thi tốc độ','{person} gửi ảnh rùa của bạn tới cuộc thi ảnh chuyển động. Ban giám khảo tưởng đó là ảnh phơi sáng.','adult,friend',[
B('Giải thích và kể chuyện chụp ảnh','Giữ giải đúng, có người học','Câu lạc bộ ảnh mời bạn hướng dẫn chụp thứ chậm nhất trong khu.','Dẫn một buổi chụp','Gửi bộ ảnh kèm ghi chú','probe', ['bond','bond']),
B('Xin đổi giải cho chủ đề kiên nhẫn','Có tên mới, cần thuyết phục','Giải mới được lập, ban tổ chức muốn bạn làm giám khảo.','Nhận với tiêu chí công khai','Chỉ đề cử người khác','deal', ['truth','bond']),
B('Trả giải, làm ngày hội thú cưng','Có nhóm vui, phải chăm đúng','Ngày hội có người xin lập nhóm trông thú khi đi vắng.','Lập lịch trông theo khả năng','Giữ hội gặp mặt thôi','bond', ['build','bond'])]),
E('a33','Bếp nhà thành lớp học bất đắc dĩ','{person} đăng nhầm lịch học nấu ăn ở bếp bạn. Sáu người tới, mỗi người mang một củ cải.','adult,home,friend',[
B('Dạy món duy nhất mình biết','Có lớp đầu, dễ lộ giới hạn','Học viên quay lại với đề nghị học món khó hơn và tự góp người dạy.','Mở lớp học chung','Chỉ giữ buổi nấu món quen','build', ['probe','exit']),
B('Cùng sáu người nấu một bữa','Có bạn mới, chưa có giáo án','Bữa cải thành lịch hẹn. Một người muốn bán phần ăn để nuôi nhóm.','Thử nhận đơn giới hạn','Giữ bữa đổi món miễn phí','bond', ['exit','bond']),
B('Xin lỗi rồi tìm bếp phù hợp','Giữ nhà, mất một buổi','Bếp cộng đồng muốn bạn điều phối vì đã đưa đủ sáu người tới.','Nhận điều phối buổi đầu','Giúp lập lịch rồi rút','truth', ['build','exit'])]),
E('a34','Cả xóm trúng cùng một giấc mơ','{person} mơ thấy con số giống năm người khác. Họ muốn lập hội giải mộng, mời bạn làm thư ký.','adult,vn,neighbor',[
B('Ghi giấc mơ thành truyện','Có chất liệu, chịu lời bình','Cuốn truyện có người xin diễn, nhưng ai cũng muốn mình là nhân vật chính.','Viết vai cho cả nhóm','Giữ bản in chia từng nhà','show', ['build','deal']),
B('Tổ chức buổi nói chuyện kiểm chứng','Có người học, dễ mất vui','Nhóm thấy mình nhớ khác nhau và muốn cùng ghi nhật ký một tháng.','Duy trì sổ có ngày ghi','Chuyển thành hội kể chuyện','probe', ['bond','truth']),
B('Đổi hội thành quỹ tiết kiệm nhỏ','Có ích cụ thể, cần giữ tin','Tiền quỹ đủ mua một món dùng chung. Hai người muốn hai món khác nhau.','Bỏ phiếu bằng quy tắc trước','Chia quỹ về từng người','deal', ['bond','deal'])]),
E('a35','Chiếc xe tự nhận là xe cưới','{person} mượn xe bạn rồi quên tháo hoa. Sáng ra có người hỏi đặt cho đám tới.','adult,friend',[
B('Thử dịch vụ trang trí xe','Có nghề phụ, cuối tuần bận','Khách muốn thuê trọn gói cả người dẫn đoàn, còn bạn chỉ có thời gian trang trí buổi sáng.','Rủ bạn chia việc có sổ','Chỉ giữ khâu trang trí','build', ['deal','exit']),
B('Cho bạn mượn hoa mở quầy','Có đồng minh, chia khách','Quầy có khách, người bạn muốn mua lại bộ hoa gốc làm biển hiệu.','Đổi hoa lấy phần góp rõ','Tặng hoa và giữ tình bạn','bond', ['deal','care']),
B('Giữ hoa cho một chuyến đi nhà','Có kỷ niệm, chịu ánh nhìn','Gia đình muốn tổ chức chuyến đi hằng năm, lần sau thêm cả hàng xóm.','Chia xe và lịch từng nhà','Giữ chuyến riêng cho gia đình','exit', ['deal','bond'])]),
E('a36','Tượng sáp giống bạn quá mức','{person} dẫn bạn tới gian trưng bày có tượng mang gương mặt mình. Nghề ghi dưới chân lại rất khác.','adult,friend',[
B('Hỏi nguồn ảnh và sửa nhãn','Rõ chuyện, chịu chú ý','Nghệ nhân muốn làm tượng đúng nghề của bạn, cần bạn ngồi mẫu.','Nhận làm mẫu có thỏa thuận','Xin sửa mặt tượng cũ','probe', ['deal','build']),
B('Diễn cùng tượng một buổi','Có màn lạ, phải giữ giới hạn','Gian diễn muốn ký lịch dài hạn, vai diễn bắt đầu lấn thời gian nghề thật.','Nhận lịch ngắn theo mùa','Viết vai cho diễn viên khác','show', ['bond','show']),
B('Xin đổi tượng lấy đồ học nghề','Có ích thật, bỏ hào quang lạ','Dụng cụ được chuyển cho một lớp, họ mời bạn dạy buổi đầu.','Dạy điều mình giỏi','Tìm thầy nghề tốt hơn','deal', ['care','probe'])]),
E('a37','Hộp thư chỉ nhận thư tình hộ','{person} đọc nhầm số nhà. Cả tháng, hộp thư bạn đầy thơ của hai người không quen.','adult,neighbor',[
B('Tìm đúng người nhận','Có câu chuyện, phải giữ riêng tư','Hai người cảm ơn và muốn nhờ bạn làm chứng trong một cuộc gặp làm lành.','Chỉ giúp sắp cuộc gặp','Giới thiệu nơi gặp trung lập','care', ['care','bond']),
B('Đặt biển sửa địa chỉ bằng thơ','Có tiếng cười, nổi danh cửa','Một tiệm sách xin dùng bài biển làm đầu một tuyển tập thư thất lạc.','Góp bài của mình thôi','Giữ biển trước cửa nhà','show', ['deal','bond']),
B('Nhờ bưu tá cùng xử lý','Đúng đường, có người quen nghề','Bưu tá rủ bạn giữ điểm gom thư cho khu hẻm. Mọi người muốn tự chọn giờ tới lấy.','Nhận điểm gom giờ cố định','Giúp làm bản đồ số nhà','probe', ['bond','care'])]),
E('a38','Cái giếng trả lại đồ cũ','{person} vớt được mười chiếc điện thoại từ giếng cạn. Một chiếc còn màn hình ảnh của bạn.','adult,neighbor',[
B('Tìm chủ từng món','Có mạng quen, tốn nhiều buổi','Một chủ máy tìm được ảnh gia đình thất lạc và muốn cùng bạn phục hồi ảnh cho xóm.','Lập buổi phục hồi ảnh','Chỉ giúp những máy đã rõ chủ','care', ['build','care']),
B('Mời người có nghề phục hồi','Giữ dữ liệu, chia công','Người thợ đề nghị cùng mở bàn sửa đồ nhỏ, chia nhau công sửa và trách nhiệm giữ đồ khách.','Thử bàn sửa cuối tuần','Giới thiệu khách không góp vốn','build', ['build','deal']),
B('Dùng đồ vô chủ làm triển lãm có phép','Có chuyện xóm, cần giữ riêng tư','Khách nhận ra món đồ của nhà mình, muốn thêm lời kể vào biển.','Ghi chuyện khi được đồng ý','Trả đồ và giữ ảnh vật dụng','show', ['bond','bond'])]),
E('a39','Bản hợp đồng viết bằng lời bài hát','{person} gửi hợp đồng, nhưng phần điều khoản bị máy tự thay bằng lời một bài hát tự chế.','adult,partner',[
B('Viết lại từng điều cho rõ','Có nền tin, chậm ký','Bản rõ ràng giúp tránh một tranh cãi, đối tác muốn bạn soạn mẫu chung.','Nhờ người có nghề kiểm mẫu','Chỉ ghi quy trình hai bên dùng','probe', ['probe','build']),
B('Biến bài hát thành quảng bá chung','Có chất riêng, phải chia quyền','Bài hát được mời diễn ở chợ, mỗi người muốn tên mình trước.','Chia vai và quyền bằng giấy','Giữ bài hát chỉ trong nhóm','show', ['deal','show']),
B('Chia dự án thành việc nhỏ trước','Giảm rủi ro, chậm lớn','Việc nhỏ chạy tốt, đối tác xin ghép thành hợp đồng dài.','Ký theo mốc đã kiểm chứng','Giữ từng đơn độc lập','deal', ['deal','bond'])]),
E('a40','Khu phố có hai mặt trời','{person} treo gương quảng cáo quá lớn. Sáng nào phòng bạn cũng sáng như giữa trưa từ lúc năm giờ.','adult,home,neighbor',[
B('Cùng điều chỉnh tấm gương','Giữ tình, bớt ánh sáng thừa','Gương được xoay thành bảng chỉ đường phản quang, xóm xin dùng thêm.','Làm biển chung có người kiểm','Giữ một tấm ở chỗ cần','bond', ['probe','bond']),
B('Đổi giờ sinh hoạt thử một mùa','Có buổi sáng, mất đêm yên','Bạn làm xong việc sớm, một nhóm chạy bộ rủ bạn điều phối lịch.','Nhận lịch theo sức mình','Giữ sáng riêng để học nghề','probe', ['deal','probe']),
B('Xin kiểm tra tác động cho cả dãy','Có giải pháp, dễ thành tranh cãi','Cả dãy thống nhất sửa biển, cửa hàng muốn bù bằng thẻ mua hàng.','Chia phần bù theo hộ','Dùng phần bù làm rèm chung','defy', ['deal','build'])]),
E('a41','Lễ khai trương thiếu cửa','{person} cắt băng xong mới biết đội thợ lắp cửa phía trong. Khách đang đứng ngoài nhìn bánh.','adult,shop,partner',[
B('Bán ngay trên vỉa sân được phép','Giữ ngày mở, thu hẹp chỗ','Quầy nhỏ được yêu thích hơn gian chính. Khách xin giữ kiểu bán ấy.','Tách quầy ngoài thành dòng riêng','Mời khách trở lại gian chính','build', ['bond','bond']),
B('Biến thành tiệc ngoài trời','Có kỷ niệm, hoãn doanh thu','Khách muốn đặt tiệc tiếp theo, nhưng họ tưởng bạn chuyên tổ chức sự kiện.','Thử một tiệc theo khả năng','Giới thiệu bên làm tiệc thật','show', ['bond','build']),
B('Mời khách góp ý trước ngày mở lại','Có đồng thiết kế, nhiều ý trái','Khách góp ý muốn chia hai không gian yên và ồn.','Thử thiết kế chia khu','Giữ thiết kế nhỏ dễ vận hành','bond', ['deal','bond'])]),
E('a42','Tờ lịch bị in hai tháng bảy','{person} gửi lịch công việc. Cả nhóm đã hẹn khách vào tháng bảy thứ hai không tồn tại.','adult,job,boss',[
B('Gọi từng khách sửa lịch','Giữ uy tín, mất công giải thích','Khách lớn đánh giá cách bạn sửa lỗi, muốn bạn quản lịch dự án khác.','Nhận lịch với công cụ rõ','Chỉ hướng dẫn cách xác nhận','truth', ['bond','probe']),
B('Rủ nhóm làm sổ lịch kiểm chéo','Có hệ thống, thêm bước việc','Sổ giúp tránh lỗi, nhưng một người luôn quên cập nhật.','Thiết kế ca kiểm chéo','Đơn giản hóa mẫu ghi','build', ['probe','bond']),
B('Tổ chức ngày bù cho khách','Có cơ hội gặp, tốn một buổi','Ngày bù biến thành dịp khách kết nối nhau và muốn làm đều.','Làm buổi theo quý','Giữ gặp riêng theo nhu cầu','deal', ['build','bond'])]),
E('a43','Mũ bảo hiểm biết hát','{person} sửa tai nghe rồi gắn nhầm vào mũ của bạn. Mỗi khi đội lên, mũ hát bài chúc mừng.','adult,friend',[
B('Nhờ sửa rồi học cách làm','Có tay mới, tốn buổi thử','Hai người làm được đồ phát nhắc lịch, một nhóm người già muốn dùng thử.','Thử dưới hướng dẫn rõ','Giữ đồ cho việc cá nhân','probe', ['probe','bond']),
B('Dùng mũ diễn một tiết mục','Có khán giả, dễ quá đà','Khán giả muốn đặt đồ diễn tương tự, nhưng mỗi người yêu cầu một giọng.','Nhận đơn trong khả năng','Bán kịch bản không bán thiết bị','show', ['build','deal']),
B('Tặng linh kiện cho lớp nghề','Có người học, bỏ trò riêng','Lớp tạo ra món đồ hữu ích hơn và mời bạn tới kể nguồn gốc.','Góp một buổi hướng dẫn','Giữ liên hệ với nhóm học','care', ['deal','probe'])]),
E('a44','Cuộc thi im lặng có người dẫn','{person} giao bạn micro để khai mạc cuộc thi im lặng. Luật cấm mọi tiếng nói từ giờ bắt đầu.','adult,friend',[
B('Dẫn bằng bảng viết','Có cách diễn mới, chậm nhịp','Người dự thích bảng đến mức muốn dùng cho họp gia đình khó nói.','Giúp dựng buổi trò chuyện','Giữ bảng cho trò chơi','show', ['care','show']),
B('Đổi vai thành người giữ giờ','Giữ luật, lùi sân khấu','Ban tổ chức mời bạn điều phối sự kiện tiếp, nơi ai cũng muốn phát biểu.','Nhận điều phối có luật lượt','Chỉ nhận vai hậu trường','build', ['build','bond']),
B('Đề nghị mọi người cùng sửa luật','Có đồng thuận, mất vẻ tuyệt đối','Nhóm thống nhất mỗi người một phút nói và muốn lập hội lắng nghe.','Thử hội theo buổi nhỏ','Gửi luật cho nhóm tự dùng','deal', ['bond','bond'])]),
E('a45','Con tem đáng giá hơn lá thư','{person} nhặt thư cũ của bạn đem hỏi người sưu tầm. Họ trả giá cao cho tem, không đọc thư.','adult,friend',[
B('Bán tem, giữ nguyên lá thư','Có tiền, mất một phần kỷ vật','Người mua phát hiện thư cũng có giá trị lịch sử và muốn xem bản sao.','Chia bản đã che chuyện riêng','Giữ nội dung trong gia đình','deal', ['deal','bond']),
B('Giữ tem và tìm người viết','Có hành trình, bỏ khoản tiền','Người viết còn sống và giữ một tập thư đáp chưa gửi.','Gặp để ghép câu chuyện','Trao thư qua người thân','probe', ['bond','bond']),
B('Cho triển lãm mượn có kỳ hạn','Có người xem, phải giữ đồ','Triển lãm muốn mượn thêm đồ đời thường trong khu.','Gom đồ có biên nhận','Chỉ cho mượn một món','care', ['bond','bond'])]),
E('a46','Áo mưa đồng loạt giống bạn','{person} đặt áo cho hội. Hình in nhầm là ảnh thẻ bạn, đủ một trăm chiếc.','adult,neighbor',[
B('Xin đổi lô, giữ một áo','Giữ mặt mình, chờ hàng mới','Xưởng muốn dùng chuyện sai để giới thiệu quy trình kiểm mới.','Kể việc sửa lỗi có điều kiện','Nhận đổi rồi khép chuyện','truth', ['truth','exit']),
B('Cho dùng ảnh để gây quỹ rõ ràng','Có quỹ, thành khuôn mặt mùa mưa','Quỹ đủ tiền, nhóm muốn giữ hình bạn trên đợt áo sau.','Đổi sang hình do xóm chọn','Cho dùng thêm một đợt','show', ['bond','bond']),
B('Tổ chức buổi vẽ đè ảnh','Có áo độc bản, thêm việc chung','Mỗi người vẽ một kiểu, một tiệm xin bán bộ mẫu của cả nhóm.','Bán mẫu theo đồng thuận','Giữ áo cho người đã vẽ','bond', ['deal','bond'])]),
E('a47','Người đưa hàng chỉ nhận thơ','{person} đùa rằng đơn giao cần mật khẩu bằng thơ. Người giao tưởng thật, đứng đợi bạn gieo vần.','adult,neighbor',[
B('Đọc một câu rồi nói rõ','Có người cười, biết nhau hơn','Người giao rủ bạn góp thơ cho nhóm đọc lúc nghỉ ca.','Góp bài tự viết','Mời nhóm tới đọc ở sân','bond', ['deal','bond']),
B('Sửa hướng dẫn giao hàng','Giữ giờ, hết hiểu nhầm','Cửa hàng muốn bạn rà lại toàn bộ hướng dẫn vì khách hay lạc.','Nhận việc viết ngắn dễ hiểu','Giúp sửa riêng địa chỉ nhà','build', ['build','care']),
B('Mở trò đoán thơ trong xóm','Có hội vui, cần tự nguyện','Buổi thơ có người mang nhạc tới và xin diễn một đêm ngoài sân.','Chia vai cho người đăng ký','Giữ nhóm đọc không sân khấu','show', ['deal','show'])]),
E('a48','Bức chân dung có thêm ria','{person} vẽ chân dung bạn để treo hội chợ. Ai đó thêm ria và bức tranh bán chạy hơn bản gốc.','adult,friend',[
B('Cùng họa sĩ làm bộ tranh vui','Có nghề chung, chia bản quyền','Khách muốn đặt tranh người thân, người mẫu muốn quyền duyệt trước.','Cho người mẫu duyệt rõ','Chỉ vẽ nhân vật hư cấu','build', ['bond','bond']),
B('Yêu cầu gỡ phần sửa chưa xin phép','Giữ hình ảnh, dễ mất vui','Họa sĩ xin lỗi và mời bạn góp quy tắc cho gian tranh.','Cùng đặt quy tắc đồng ý','Nhận tranh gốc rồi dừng','defy', ['bond','exit']),
B('Đấu giá bản ria cho việc chung','Có nguồn giúp, chịu trêu lâu','Người mua treo tranh tại quán và muốn mời bạn kể chuyện mỗi năm.','Nhận một buổi kể','Xin giữ tranh không gắn tên','show', ['show','bond'])]),
E('a49','Hội nghị chỉ có người bán vé','{person} rủ bạn đi nghe diễn thuyết. Tới nơi, ai cũng mang thẻ ban tổ chức và hỏi ai là khách.','adult,friend',[
B('Biến thành buổi trao đổi tay nghề','Có giá trị thật, bỏ sân khấu','Người tới tìm được khách của nhau và muốn giữ mạng giới thiệu.','Lập nhóm giới thiệu minh bạch','Giữ vài mối làm việc hợp','build', ['truth','build']),
B('Đòi hoàn vé cùng mọi người','Giữ quyền lợi, mất buổi','Nhóm được hoàn và muốn dùng phần thời gian còn lại đi thăm một xưởng.','Cùng tổ chức chuyến thăm','Nhận hoàn rồi về việc riêng','defy', ['build','bond']),
B('Làm người hỏi chuyện tự nguyện','Có chuyện kể, lộ khoảng trống','Một người có nghề thật xin bạn dẫn buổi chia sẻ nhỏ lần tới.','Nhận với nội dung xác minh','Giúp tìm người dẫn phù hợp','probe', ['probe','probe'])]),
E('a50','Lễ trao chìa khóa toàn ổ cũ','{person} tặng bạn bó chìa khóa trong lễ nhận nhà. Không chiếc nào mở cửa, một chiếc mở tủ đồ xóm.','adult,home,neighbor',[
B('Tìm đúng từng chủ chìa','Có mạng quen, mất buổi dọn','Chìa đúng được tìm, người giữ tủ xóm nhờ bạn cùng quản đồ dùng chung.','Nhận quản theo ca','Lập sổ để ai cũng kiểm','probe', ['build','probe']),
B('Làm bảng chìa khóa ký ức','Có vật kể chuyện, vẫn cần khóa mới','Bảng được treo ở nhà chung; người ta mang thêm đồ vô dụng có chuyện hay.','Dựng góc kể chuyện đồ cũ','Giữ bảng nhỏ dễ chăm','show', ['truth','care']),
B('Mở bữa tân gia sau khi thay khóa','Có người thân, chậm nghi lễ','Bữa ăn kéo tới cả người từng sống ở nhà. Họ muốn trồng một cây chung.','Trồng cây với bảng người góp','Giữ vườn riêng và hẹn gặp','bond', ['bond','bond'])]),
];
