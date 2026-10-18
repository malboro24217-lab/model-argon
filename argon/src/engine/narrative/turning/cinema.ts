import { E, B, type Fork } from './kit.ts';
export const CINEMA: Fork[] = [
E('c01','Cô giáo gõ cửa','{person} mang tới một suất học xa nhà. Bữa tối ấy, gia đình vừa tính đủ tiền mua chiếc xe chở hàng.','kid,school,mentor',[
B('Theo suất học xa','Có chữ, xa người thân','Lá thư đầu tiên từ trường hỏi bạn có muốn trở về dạy lớp nhỏ.','Nhận dạy lớp nhỏ','Viết thư xin người thay','probe', ['care','build']),
B('Ở nhà phụ việc','Gần nhà, học đường vòng','Bạn nhớ mặt từng khách. Một người đặt hàng muốn dạy bạn đọc sổ sách.','Học sổ cùng khách','Rủ bạn mở lớp tối','build', ['probe','build']),
B('Xin học ban ngày, làm chiều','Giữ hai cửa, ít giờ nghỉ','Lịch học và buổi giao hàng lớn trùng nhau. Người trong lớp đề nghị đổi ca.','Nhận ca rồi trả giúp','Thu hẹp việc giao hàng','deal', ['care','bond'])]),
E('c02','Đứa bạn sau nhà xe','Bạn gặp {person} bị nhóm trẻ chặn sau nhà xe. Chiếc cặp nằm trên mái tôn.','kid,friend',[
B('Đứng cạnh bạn','Có đồng minh, bị để ý','Bạn ấy rủ bạn lập một nhóm đưa trẻ nhỏ về nhà an toàn.','Lập nhóm hộ tống','Nhờ người lớn tiếp quản','bond', ['build','bond']),
B('Đi tìm người giúp','Giải nguy, lộ người báo','Bạn ấy muốn biết ai đã gọi cô giáo. Nhóm chặn đường cũng hỏi câu ấy.','Kể thật trước cả lớp','Hẹn nói riêng với bạn','truth', ['truth','truth']),
B('Đánh lạc hướng lấy cặp','Liều một lần, nổi danh','Chiếc cặp trở về. Mấy đứa khác bắt đầu tìm bạn mỗi khi gặp rắc rối.','Dạy chúng tự xoay xở','Chỉ nhận giúp một việc','defy', ['care','care'])]),
E('c03','Giấy nợ trong áo bố','{person} để quên một giấy nợ dưới lớp áo. Ngày trả nợ trùng ngày gia đình định chuyển nhà.','teen,father',[
B('Hỏi bố ngay tối ấy','Biết sự thật, khó ngủ','Bố đưa bạn cuốn sổ còn nhiều trang bị xé. Chủ nợ muốn gặp riêng.','Đi cùng bố gặp chủ nợ','Nhờ người thân làm chứng','probe', ['bond','build']),
B('Kể với cả nhà','Cùng gánh, mất bí mật','Gia đình mở cuộc họp đầu tiên về tiền. Bạn được giao giữ sổ chung.','Giữ sổ công khai','Luân phiên người giữ sổ','truth', ['truth','bond']),
B('Xin chủ nợ một việc làm','Có lối trả, mang ràng buộc','Chủ nợ tin tay nghề bạn, muốn ký hợp đồng dài hơn món nợ.','Thương lượng thời hạn','Trả xong rồi rời đi','deal', ['deal','bond'])]),
E('c04','Người chú từ phương xa','{person} có chỗ ở thành phố và một chiếc vé cho bạn. Hạn đi là sáng mai.','teen,mentor',[
B('Xách túi đi cùng','Đổi nơi sống, thiếu chỗ dựa','Bạn đã quen phố. Người chú muốn bạn nhận việc trong cửa hàng của ông.','Nhận quản lý quầy','Tìm đường học nghề riêng','build', ['build','probe']),
B('Ở lại, giữ liên lạc','Giữ nhà, có cửa về sau','Một bưu kiện tới: dụng cụ nghề và lời mời bán hàng từ xa.','Mở điểm nhận hàng','Dùng dụng cụ tự học','bond', ['build','probe']),
B('Xin đi thử một mùa','Thử đời mới, có ngày về','Ngày về tới gần, người cùng phòng rủ bạn thuê chỗ chung lâu dài.','Ở thêm với bạn mới','Về nhà mở đường trao đổi','probe', ['bond','build'])]),
E('c05','Đêm nước lên','Nước dâng sát thềm. {person} giữ chìa khóa chiếc xe duy nhất còn nổ máy.','adult,neighbor',[
B('Theo xe lên thành phố','Thoát lũ, dựng lại từ đầu','Ở chỗ tạm cư, một bếp ăn cần người điều phối.','Dựng bếp thành việc làm','Chia ca để học nghề','build', ['build','deal']),
B('Ở lại giữ đồ chung','Giữ xóm, mang trách nhiệm','Xóm muốn bạn trông kho phòng lũ mới. Một hộ phản đối mức đóng góp.','Mở họp quyết mức góp','Giao kho cho nhóm luân phiên','care', ['build','bond']),
B('Rủ mọi người chở từng lượt','Cứu đồ, nợ nhiều ân tình','Chiếc xe hỏng sau chuyến cuối. Những người từng đi xe hỏi ai trả tiền.','Cùng góp sửa chiếc xe','Bàn giao xe và sổ chuyến','deal', ['deal','bond'])]),
E('c06','Cuộc thi trên tỉnh','{person} chọn bài của bạn gửi dự thi. Gia đình chưa từng thấy tên bạn trên một tấm vé.','kid,school,mentor',[
B('Đi thi bằng bài của mình','Giữ giọng riêng, dễ hụt giải','Một giám khảo gửi lại bài đầy ghi chú và lời mời học tiếp.','Theo học với người ấy','Tự làm số báo lớp','probe', ['probe','build']),
B('Nhờ cả lớp dựng tiết mục','Có đồng đội, chia hào quang','Tiết mục được mời diễn tiếp. Cả nhóm tranh nhau người đứng giữa.','Luân phiên người dẫn','Lui về làm hậu trường','bond', ['bond','build']),
B('Nhường vé cho bạn khác','Giữ một tình bạn, đổi vai','Người bạn thắng giải xin bạn quản lý lịch tập cho cả hai.','Làm người tổ chức','Đòi một lần đứng sân khấu','care', ['build','show'])]),
E('c07','Hai căn bếp','{person} hỏi bạn muốn sống cùng bên nào sau khi cha mẹ chia nhà. Hai chiếc chìa khóa nằm cạnh nhau.','kid,mother,father',[
B('Chọn ở cùng mẹ','Một mái nhà, một khoảng xa','Bố gửi lời mời dự bữa tối đầu tiên ở nhà mới.','Đến ăn cùng bố','Mời bố ra quán gặp','bond', ['bond','bond']),
B('Chọn ở cùng bố','Đổi nếp sống, nhớ bếp cũ','Mẹ nhờ bạn giữ một chậu cây từ nhà cũ, rồi xin tới thăm.','Dành một góc cho mẹ','Mang cây tới gặp mẹ','care', ['bond','bond']),
B('Xin lịch sống hai nơi','Giữ hai bên, luôn xách túi','Hai nhà tổ chức sinh nhật cùng tối. Bạn đề nghị một bàn ăn chung.','Thử bữa sinh nhật chung','Chia hai buổi bình yên','deal', ['bond','deal'])]),
E('c08','Giấy báo thi và báo nợ','Một phong bì báo trúng tuyển nằm trên giấy đòi nợ. {person} bảo chỉ đủ sức mở một phong bì.','young,money,creditor',[
B('Vay để đi học','Có tương lai, có kỳ hạn','Kỳ trả đầu tới đúng lúc bạn được mời thực tập không lương.','Xin giãn nợ để thực tập','Nhận việc có lương trước','risk', ['bond','bond']),
B('Đi làm trả nợ trước','Nhẹ gánh nhà, chậm tấm bằng','Một đồng nghiệp rủ bạn học lớp tối, nhưng ca làm tốt nhất trùng giờ.','Đổi ca để học tối','Xin học ngay tại xưởng','build', ['probe','probe']),
B('Đề nghị vừa học vừa trả','Giữ hai lối, cần người tin','Chủ nợ muốn dùng câu chuyện của bạn để quảng cáo.','Kể với điều kiện rõ','Trả tiền thay việc xuất hiện','deal', ['truth','bond'])]),
E('c09','Tình đầu ở bến xe','{person} có hai vé xe và một địa chỉ viết sai một chữ. Bạn chưa nói với gia đình.','adult,single,friend',[
B('Đi cùng người ấy','Có nhau, chưa có kế hoạch','Địa chỉ không tìm thấy. Một người ở bến cho thuê gian phòng cần sửa.','Cùng sửa phòng để ở','Tìm việc trước khi thuê','risk', ['build','probe']),
B('Ở lại, hẹn ngày đoàn tụ','Giữ nền nhà, thử lòng xa','Người ấy gửi lời mời tới thành phố đã ổn định. Công việc bạn vừa tốt lên.','Thử sống chung một mùa','Mời người ấy về thăm','bond', ['bond','bond']),
B('Rủ cả hai đi học nghề','Đi chậm, cùng dựng lối','Hai bạn trúng hai chỗ học ở hai thành phố khác nhau.','Học xa và giữ hẹn','Chọn một nghề cùng làm','build', ['probe','bond'])]),
E('c10','Người đỡ đầu muốn ký tên','{person} trả học phí cho bạn, đổi lại muốn tên mình trên mọi sản phẩm đầu tiên.','adult,mentor',[
B('Nhận sự nâng đỡ','Có vốn, mang bóng người khác','Sản phẩm bán được. Người đỡ đầu muốn quyết luôn người làm cùng bạn.','Thương lượng quyền quyết','Tách một dự án riêng','deal', ['deal','bond']),
B('Tự đi bằng việc nhỏ','Chậm hơn, giữ tên mình','Khách đầu tiên lại là người từng từ chối bạn. Họ cần một việc gấp.','Nhận với giá công khai','Giữ lịch cho khách nhỏ','build', ['truth','bond']),
B('Xin học nghề thay tiền','Giữ khoảng cách, được truyền nghề','Người thầy đưa bạn công thức cũ và nhờ giữ hộ một người học việc.','Cùng người mới mở xưởng','Chép nghề thành tài liệu','probe', ['build','probe'])]),
E('c11','Cuộc gọi từ nơi sơ tán','{person} báo chỗ ở cũ sắp phải rời đi. Một xe cứu trợ còn ghế, một kho hàng còn người.','adult,neighbor',[
B('Đi theo đoàn sơ tán','Được che chở, xa quê','Đoàn cần người đại diện xin chỗ học cho trẻ. Mọi người nhắc tên bạn.','Nhận việc đại diện','Dạy một lớp tạm thời','care', ['bond','care']),
B('Ở lại giúp đóng kho','Giữ tài sản chung, đi muộn','Chìa khóa kho được giao cho bạn. Một chủ hàng đòi ưu tiên lấy đồ.','Mở sổ chia lượt','Nhờ tổ cứu trợ quản kho','defy', ['deal','build']),
B('Tìm chỗ ở nhờ cho nhóm','Tự xoay xở, nợ ân tình','Chủ nhà muốn nhóm bạn ở lại làm mùa thu hoạch.','Ký thỏa thuận cả nhóm','Tìm nơi ở lâu dài','deal', ['deal','probe'])]),
E('c12','Lời hứa đến hạn','{person} đặt lên bàn tờ giấy bạn viết khi khó khăn. Hôm nay cũng là hạn nhận việc mới.','adult,mentor',[
B('Trở lại giữ lời','Giữ người cũ, lỡ một chuyến','Người ấy muốn trao lại việc đang làm cho bạn.','Nhận việc và đổi cách làm','Đào tạo người thay mình','care', ['bond','build']),
B('Đi theo công việc mới','Có cơ hội, mang món nợ tình','Một lời giới thiệu từ người cũ vẫn tới. Bạn phải quyết định cách đáp lại.','Công khai ghi nhận ân nhân','Trở về giúp một mùa','build', ['truth','care']),
B('Đề nghị làm cùng từ xa','Giữ hai đầu, lịch kín','Việc hai bên cùng cần bạn trong một ngày. Một cộng sự xin quyền quyết.','Giao quyền cho cộng sự','Thu gọn một cam kết','deal', ['bond','exit'])]),
E('c13','Tên bạn trên biên bản','{person} đưa bản nhận lỗi để bạn ký. Camera ở hành lang có thể kể chuyện khác.','adult,job,boss',[
B('Nhận phần lỗi của mình','Giữ nghề, bị soi kỹ','Bạn được giao sửa quy trình gây lỗi. Người từng ký biên bản muốn tham gia.','Cùng sửa và ghi công','Xin người ngoài kiểm lại','truth', ['build','probe']),
B('Yêu cầu xem chứng cứ','Có thể minh oan, mất lòng','Đồng nghiệp đưa bạn bản sao. Họ cũng cần bạn làm chứng trong vụ khác.','Làm chứng bằng điều đã thấy','Nhờ đại diện bảo vệ cả hai','probe', ['build','care']),
B('Rời việc và mang tay nghề','Tự do, phải dựng lại','Khách cũ tìm tới, muốn thuê bạn làm riêng nhưng không muốn công khai.','Nhận hợp đồng minh bạch','Tìm khách không ràng buộc','exit', ['deal','probe'])]),
E('c14','Vé làm việc ở nước ngoài','{person} giới thiệu một hợp đồng xa nhà. Dòng chữ về nơi giữ giấy tờ bị gạch đi.','adult,friend',[
B('Chuẩn bị đi sau khi xác minh','Mở thị trường, xa người quen','Hồ sơ tới bước mới. Bạn được nhờ cùng kiểm hợp đồng cho người tiếp theo.','Giúp kiểm hợp đồng cho bạn','Chỉ chia sẻ kinh nghiệm','probe', ['probe','probe']),
B('Ở lại học tay nghề','Ít tiền ngay, có nền riêng','Một xưởng nước ngoài đặt hàng tại chỗ, cần người phiên dịch kỹ thuật.','Nhận thử đơn đầu','Rủ thầy nghề cùng làm','build', ['bond','bond']),
B('Rủ nhóm đàm phán lại','Có tiếng nói, có thể mất vé','Nhóm đạt hợp đồng mới nhưng muốn bạn đứng ra chịu trách nhiệm chung.','Đại diện với giới hạn rõ','Luân phiên người đại diện','defy', ['exit','bond'])]),
E('c15','Đám cưới đã đặt cỗ','Gia đình đặt cỗ trước khi hỏi ý bạn. {person} mang danh sách khách tới xin kiểm lại.','adult,single,sibling',[
B('Gặp người được mai mối','Có thể hợp, chịu áp lực','Người ấy cũng muốn thoát sức ép. Hai bạn có thể thành đồng minh trước.','Hẹn hò theo lịch riêng','Cùng nói rõ với gia đình','bond', ['bond','truth']),
B('Tuyên bố hoãn đám cưới','Giữ quyền chọn, chịu tiếng','Một họ hàng trả hộ tiền cọc và nhờ bạn giúp con họ có quyền chọn tương tự.','Đứng cùng người em','Hoàn tiền rồi rút khỏi tranh cãi','defy', ['bond','exit']),
B('Biến cỗ cưới thành tiệc nhà','Giữ cuộc gặp, đổi ý nghĩa','Bữa tiệc thành dịp nối lại hai nhánh họ. Mọi người muốn làm hằng năm.','Nhận tổ chức buổi sau','Giao mỗi nhà một lần','show', ['build','bond'])]),
E('c16','Phong bì ở đám tang','{person} đưa bạn phong bì của người vừa mất. Trong đó có tên ba người cùng góp tiền.','adult,partner',[
B('Tìm đủ ba người','Có sự thật, chậm nhận phần','Ba người kể ba phiên bản. Một cuốn sổ cuối đang do bạn giữ.','Mở sổ trước mặt cả ba','Nhờ người độc lập đối chiếu','probe', ['truth','probe']),
B('Nhận phần rồi hoàn việc dở','Có vốn, gánh chuyện cũ','Dự án sống lại. Gia đình người mất muốn cùng quyết tên của nó.','Chia quyền với gia đình','Tách phần vốn và kỷ niệm','build', ['deal','bond']),
B('Giao phong bì cho gia đình','Rời tranh chấp, giữ một tình','Gia đình nhờ bạn kể lại con người ấy trong buổi tưởng niệm.','Kể cả điều chưa đẹp','Viết riêng cho người thân','care', ['truth','build'])]),
E('c17','Hùn vốn với bạn thân','{person} thuê được mặt bằng, thiếu nửa vốn. Bản kế hoạch viết trên mặt sau một tờ thực đơn.','adult,money,before50,friend',[
B('Góp vốn, chuyển sang đứng quầy','Đổi nghề, làm chung dễ va chạm','Quán có khách, nhưng hai người đều muốn giữ chìa khóa két.','Công khai sổ mỗi tuần','Chia ca và chia quyền','build', ['truth','deal']),
B('Cho thuê dụng cụ thay góp vốn','Có thu đều, giữ khoảng cách','Bạn ấy muốn mua lại dụng cụ bằng phần doanh thu tương lai.','Đổi thành hợp đồng góp dần','Giữ tiền thuê cố định','deal', ['deal','build']),
B('Giới thiệu khách, giữ tiền riêng','Giúp bạn, tự do rút lui','Khách bạn giới thiệu trở thành người mua lớn và đòi ưu tiên.','Giúp hai bên đàm phán','Tách khỏi việc chia phần','bond', ['deal','deal'])]),
E('c18','Cơn sốt ở bãi đất','{person} nói bãi đất cạnh đường sắp có giá. Bạn có giấy mua thật, còn tin quy hoạch chỉ truyền miệng.','adult,money,land,neighbor',[
B('Giữ đất, chờ thông tin','Giữ cơ hội, chôn vốn','Đường chưa mở. Một nhóm muốn thuê đất làm vườn chung.','Cho thuê theo mùa','Giữ đất cho việc riêng','probe', ['build','bond']),
B('Bán một phần để có vốn','Chốt phần chắc, còn phần chờ','Người mua dựng quán, đề nghị cùng khai thác phần đất còn lại.','Hợp tác bằng giấy rõ','Giữ ranh giới độc lập','deal', ['bond','exit']),
B('Mở việc làm ngay trên đất','Có nguồn sống, bỏ giấc sốt','Khách quen muốn đặt chỗ dài hạn trước khi đường mở.','Nhận đặt chỗ có giới hạn','Giữ chỗ cho người trong xóm','build', ['exit','bond'])]),
E('c19','Một đứa trẻ ở cửa','{person} nhờ bạn nuôi hộ một đứa trẻ trong một tháng. Chiếc túi chỉ có hai bộ áo.','adult,sibling',[
B('Đón trẻ vào nhà','Có người cần mình, đổi nếp sống','Tháng đã qua, người lớn chưa thu xếp được. Trẻ muốn đi học gần nhà bạn.','Nhận chăm với thỏa thuận rõ','Tìm người chăm ổn định cùng nhau','care', ['deal','probe']),
B('Tìm một mái nhà chung sức','Chia gánh, cần giữ lời','Nhóm chăm trẻ muốn bạn giữ lịch và khoản đóng góp.','Lập lịch chăm công khai','Đào tạo người điều phối khác','bond', ['truth','build']),
B('Giúp người thân có việc gần','Giữ mẹ con bên nhau, tốn công','Việc mới ổn định, nhưng người chủ muốn đổi lịch đúng giờ đón trẻ.','Thương lượng lịch cả nhóm','Giúp tìm việc khác phù hợp','build', ['deal','probe'])]),
E('c20','Chiếc ghế có phong bì','{person} mời bạn nhận một vị trí mới. Trong ngăn kéo có phong bì không ghi người gửi.','adult,job,official',[
B('Nhận ghế, công khai sổ','Có quyền làm, có người chống','Sổ công khai làm một nhóm khó chịu; nhân viên cũ xin đứng cùng bạn.','Lập nhóm kiểm tra chéo','Chuyển sổ cho cơ quan giám sát','truth', ['probe','bond']),
B('Từ chối ghế, giữ bản ghi','Giữ mình, giữ một chứng cứ','Người kế nhiệm tìm bạn hỏi vì sao đã từ chối.','Kể bằng chứng đang có','Đề nghị cùng kiểm tra độc lập','probe', ['truth','probe']),
B('Đòi điều kiện trước khi nhận','Có thể đổi luật, mất cơ hội','Điều kiện được chấp nhận. Giờ chính người ủng hộ xin một ngoại lệ.','Giữ luật với người nhà','Rời ghế thay việc phá lệ','defy', ['defy','bond'])]),
E('c21','Tin nhắn lúc hai giờ sáng','Điện thoại của {person} sáng lên một lời nhắn thân mật. Ngày mai là chuyến đi hai người đã đặt.','adult,spouse',[
B('Hỏi ngay trước chuyến đi','Biết câu trả lời, mất bình yên','Cuộc nói chuyện mở ra chuyện cả hai giấu lâu nay. Người ấy muốn thử sửa lại.','Thử một thỏa thuận mới','Chọn sống riêng một thời gian','truth', ['deal','bond']),
B('Đi chuyến đi rồi nói','Có thời gian, mang nghi ngờ','Ở nơi xa, người ấy chủ động đưa điện thoại và hỏi điều bạn chưa từng hỏi.','Nói điều mình đang sợ','Hẹn một cuộc gặp có người giúp','bond', ['truth','care']),
B('Hoãn chuyến đi, giữ khoảng riêng','Có khoảng thở, dễ xa nhau','Bạn nhận lại tiền vé dưới dạng phiếu cho hai người, hạn dùng sắp hết.','Mời người ấy đi lại','Dùng phần mình để đi riêng','exit', ['bond','bond'])]),
E('c22','Mái xưởng sau đám cháy','{person} đứng trước mái xưởng cháy. Khách vẫn chờ đơn hàng, còn hồ sơ bảo hiểm nằm trong két.','adult,shop,partner',[
B('Dựng xưởng tạm giao đơn','Giữ khách, làm trong thiếu thốn','Khách lớn đề nghị mua một phần xưởng để giúp dựng lại.','Nhận vốn giữ quyền nghề','Giữ xưởng nhỏ tự chủ','build', ['bond','bond']),
B('Theo hồ sơ đòi bảo hiểm','Giữ quyền lợi, mất thời gian','Được bồi thường một phần, bạn phải chọn dựng lại hay chuyển nghề.','Dựng lại có phòng cháy','Dùng tay nghề sang xưởng khác','probe', ['build','bond']),
B('Thuê chung xưởng của đối thủ','Tiếp tục nghề, ở sân người khác','Hai xưởng làm chung tốt hơn dự tính. Đối thủ muốn dùng một tên.','Lập thương hiệu chung','Giữ hai tên cùng chia máy','deal', ['build','deal'])]),
E('c23','Vạch sơn trên tường nhà','Một vạch sơn đi ngang cửa nhà. {person} đưa danh sách đền bù, thiếu tên một hộ cuối ngõ.','adult,home,neighbor',[
B('Nhận tiền, tìm chỗ mới','Có vốn chuyển, bỏ nếp cũ','Hộ bị thiếu tên tìm bạn nhờ mua chung một mảnh đất nơi mới.','Góp một phần có giấy','Giúp họ tìm nhóm mua khác','build', ['deal','deal']),
B('Đòi kiểm lại danh sách','Giữ quyền xóm, chậm nhận tiền','Danh sách sửa xong, xóm muốn bạn đại diện thương lượng chỗ tái cư.','Đại diện có nhóm giám sát','Luân phiên người thương lượng','defy', ['bond','deal']),
B('Rủ xóm mua chung chỗ ở','Giữ người quen, chia rủi ro','Nhóm có đất nhưng không thống nhất ai ở mặt tiền.','Bốc thăm công khai vị trí','Đổi thiết kế dùng sân chung','deal', ['truth','bond'])]),
E('c24','Hai mâm cơm cùng một giờ','{person} đưa thiệp ăn tối bên ngoại. Bên nội vừa báo có người đi xa về đúng hôm đó.','adult,spouse',[
B('Đến bên người đi xa về','Giữ dịp hiếm, lỡ bên kia','Bên còn lại gửi món ăn bạn thích, kèm lời nhắn lần tới phải nấu.','Tự nấu bữa bù','Mời hai bên ăn ngoài','care', ['bond','bond']),
B('Theo lịch đã hẹn trước','Giữ lời hẹn, chịu lời trách','Người đi xa xin gặp riêng, muốn nhờ bạn một việc không nói trong tiệc.','Nghe việc rồi mới nhận','Mời cả nhà cùng nghe','bond', ['bond','bond']),
B('Mời hai nhà tới một bàn','Có thể hòa, dễ thành trận','Hai nhà thống nhất ngồi chung, rồi cùng giao bạn tổ chức dịp tiếp theo.','Đặt lệ mỗi nhà góp món','Chuyển thành tiệc ngoài trời','deal', ['deal','bond'])]),
E('c25','Chiếc vali của em','{person} trở về với một chiếc vali. Người ấy xin ngủ nhờ, chưa muốn kể vì sao.','adult,sibling',[
B('Dành phòng, chưa hỏi chuyện','Có chỗ an toàn, gánh nếp mới','Người ấy đã có việc, muốn ở lại góp tiền và đón con về.','Thỏa thuận một nhà chung','Giúp thuê chỗ gần nhau','care', ['deal','care']),
B('Tìm chỗ ở độc lập cùng em','Giữ khoảng riêng, tốn công dựng','Chủ nhà muốn bán căn phòng. Người ấy rủ bạn mua chung.','Xem khả năng góp hợp lý','Giúp giữ hợp đồng thuê','build', ['deal','deal']),
B('Hẹn một cuộc nói chuyện có người chứng','Có ranh giới, khó mở lòng','Cuộc nói chuyện giúp rõ chuyện, nhưng một bên muốn bạn đứng hẳn về phía họ.','Giữ vai người làm chứng','Rút khỏi hòa giải tiếp','truth', ['build','exit'])]),
E('c26','Tên bạn trong danh sách ứng viên','{person} hỏi bạn có nhận ra tranh một vị trí đại diện. Người từng đối đầu với bạn đã đăng ký.','adult,official',[
B('Ra tranh bằng một việc cụ thể','Có tiếng nói, chịu soi xét','Việc đầu làm được. Những người giúp vận động muốn phần ưu tiên.','Giữ tiêu chí đã hứa','Mời họ cùng chịu giám sát','defy', ['defy','bond']),
B('Giúp một người khác ra tranh','Có đồng minh, ít quyền quyết','Người ấy thắng rồi mời bạn quản khoản quỹ khó nhất.','Nhận với sổ công khai','Giữ vai người giám sát','bond', ['truth','bond']),
B('Lập nhóm dân tự làm việc ấy','Làm ngay, thiếu danh chính','Nhóm làm xong, vị đại diện muốn gắn tên mình vào kết quả.','Chia công bằng bản ghi','Giữ nhóm độc lập tiếp','build', ['deal','build'])]),
E('c27','Một năm còn lại','Một kết quả kiểm tra khiến bạn tưởng chỉ còn một năm. {person} cầm vé chuyến đi bạn từng hoãn.','adult,friend',[
B('Đi ngay khi còn sức','Sống điều muốn, xáo trộn đời','Kết quả được đính chính. Chuyến đi đã cho bạn một nghề mới để thử.','Theo nghề mới một mùa','Mang trải nghiệm về việc cũ','show', ['bond','bond']),
B('Thu xếp điều còn dang dở','Giữ người thân, nhìn lại','Kết quả được đính chính. Người bạn vừa làm lành vẫn muốn gặp mỗi tuần.','Giữ cuộc hẹn ấy','Cùng mở việc nhỏ từng hứa','care', ['bond','build']),
B('Xin kiểm tra lại rồi quyết','Có căn cứ, chậm một nhịp','Kết quả được đính chính. Bạn có khoản tiền dành cho chuyến đi chưa dùng.','Đặt ngày đi thật','Dùng tiền học điều mới','probe', ['bond','probe'])]),
E('c28','Lá thư không ghi người gửi','{person} chuyển tới một lá thư về người cũ và một đứa trẻ. Bên trong có ảnh nhưng thiếu ngày chụp.','adult,friend',[
B('Tìm hiểu trước khi nhận lời','Có sự thật, chuyện lan rộng','Sự thật rõ hơn. Người chăm trẻ hỏi bạn có muốn giữ liên lạc.','Giữ một cuộc hẹn đều','Giúp rồi tôn trọng khoảng cách','probe', ['bond','care']),
B('Giúp trẻ trước, hỏi chuyện sau','Giúp được ngay, dễ mang kỳ vọng','Người chăm trẻ muốn ghi tên bạn vào danh sách liên hệ của trường.','Nhận vai có giới hạn rõ','Tìm người giám hộ phù hợp','care', ['exit','probe']),
B('Mời mọi người nói chuyện cùng','Minh bạch, phải đối mặt','Cuộc gặp kết thúc bằng lời đề nghị chia sẻ trách nhiệm chăm sóc.','Lập thỏa thuận chung','Giúp một khoản độc lập','truth', ['deal','care'])]),
E('c29','Danh sách cắt giảm nhân sự','{person} cho bạn xem danh sách có tên mình. Gói nghỉ việc đủ mở một quầy nhỏ.','late,before70,job,boss',[
B('Nhận gói, chuyển sang mở quầy','Đổi nghề, mất lương đều','Đồng nghiệp cũ tới xin làm cùng. Họ giỏi nghề nhưng muốn quyền ngang bạn.','Góp sức và chia quyền rõ','Thuê theo dự án thử trước','build', ['deal','build']),
B('Học lại nghề công ty cần','Giữ chỗ, làm người mới','Bạn qua khóa học. Người từng hướng dẫn giờ cần bạn dạy lại.','Mở nhóm học trong công ty','Đổi sang vị trí khác','probe', ['probe','bond']),
B('Thương lượng cho cả nhóm','Có sức tập thể, dễ mất lòng','Nhóm giữ được việc một mùa. Giờ họ muốn bạn đại diện dài hạn.','Nhận với nhiệm kỳ rõ','Luân phiên đại diện nhóm','defy', ['bond','bond'])]),
E('c30','Chủ nợ cũ đến xin việc','{person} từng giữ giấy nợ của bạn. Hôm nay người ấy đứng ngoài cửa hỏi có việc gì không.','late,creditor',[
B('Thuê bằng điều kiện rõ','Đảo vai, thử lòng nhau','Người ấy làm tốt, biết một đầu mối có thể cứu đơn hàng của bạn.','Tin và chia phần công','Kiểm tra đầu mối trước','deal', ['deal','probe']),
B('Giúp tìm việc nơi khác','Giữ tình, giữ khoảng cách','Người ấy giới thiệu khách mới cho bạn và muốn cùng nhận một dự án.','Thử một đơn nhỏ','Giữ quan hệ giới thiệu','bond', ['bond','bond']),
B('Mời kể hết chuyện nợ cũ','Có thể khép chuyện, nghe điều khó','Trong sổ cũ có một khoản bạn đã trả hai lần. Người ấy muốn bù.','Nhận bù bằng tiền','Đổi khoản bù thành học bổng','truth', ['bond','probe'])]),
E('c31','Con đặt áo công nhân lên bàn','{person} xin nghỉ học để đi làm. Giọng nói giống hệt bạn khi còn trẻ.','late,child',[
B('Cho thử một mùa làm việc','Có trải nghiệm, có thể bỏ học','Con thích nghề nhưng cần chứng chỉ để lên bậc.','Cùng tìm lớp nghề tối','Để con chọn đường khác','probe', ['probe','bond']),
B('Giúp con học theo lối khác','Giữ học, đổi kỳ vọng','Con tìm được ngành ít tiếng tăm nhưng rất muốn theo.','Ủng hộ lựa chọn của con','Thử một khóa ngắn trước','care', ['care','bond']),
B('Cùng con mở một việc nhỏ','Có việc chung, dễ lẫn vai','Con muốn giữ phần khách riêng, không đứng dưới tên bạn nữa.','Tách khách và chia dụng cụ','Giữ việc chung theo ca','build', ['deal','bond'])]),
E('c32','Phong bì bị gửi nhầm','{person} gửi bạn hồ sơ tố một vụ sai phạm. Tên bạn nằm trong phần người làm chứng.','late,official',[
B('Làm chứng bằng điều đã thấy','Có trách nhiệm, chịu sức ép','Người từng đối đầu xác nhận lời bạn, rồi xin bạn giúp một việc khác.','Nghe việc trước khi nhận','Chỉ giữ liên hệ chính thức','truth', ['bond','exit']),
B('Tìm thêm người cùng xác nhận','Có nhóm, chậm hành động','Nhóm thống nhất nhưng có người muốn đổi lời để giữ việc.','Bảo vệ người muốn rút','Nộp phần chứng cứ độc lập','probe', ['exit','bond']),
B('Giao hồ sơ cho người đủ thẩm quyền','Giữ khoảng cách, mất quyền theo dõi','Một cuộc rà soát bắt đầu và mời bạn vào nhóm sửa quy trình.','Tham gia sửa quy trình','Giữ vai cung cấp tài liệu','exit', ['build','probe'])]),
E('c33','Người lạ mang ảnh gia đình','{person} dẫn tới một người nói cùng cha với bạn. Tấm ảnh có chiếc ghế bạn vẫn giữ.','late,sibling',[
B('Mời người ấy vào nhà','Có thêm người thân, mở chuyện cũ','Người ấy xin cùng chăm mộ gia đình và góp phần sửa nhà.','Cùng làm một việc chung','Hẹn gặp trước khi góp tiền','bond', ['build','deal']),
B('Xác minh rồi nói chuyện chia phần','Rõ quyền lợi, dễ lạnh lòng','Kết quả rõ ràng, nhưng một người trong nhà phản đối việc nhận họ hàng.','Mời cả nhà nghe câu chuyện','Giữ liên hệ riêng trước','probe', ['bond','bond']),
B('Giữ tình thân ngoài chuyện tài sản','Có quan hệ, còn câu hỏi tiền','Người ấy để lại một món đồ của cha và không đòi phần.','Trao lại một kỷ vật','Rủ cùng kể lịch sử gia đình','care', ['bond','truth'])]),
E('c34','Bạn thân ở hành lang bệnh viện','{person} nhờ bạn xoay khoản tiền điều trị. Người ấy vẫn đùa rằng lần này sẽ trả bằng tuổi thọ.','late,friend',[
B('Góp tiền và cùng thu xếp','Giúp ngay, mỏng phần dự phòng','Người bạn hồi phục muốn cùng mở một việc làm ít hại sức khỏe.','Thử việc nhỏ cùng nhau','Giúp bạn tìm việc ổn định','care', ['build','probe']),
B('Rủ nhóm bạn chia khoản giúp','Chia sức, phải minh bạch','Quỹ còn dư. Nhóm muốn giữ để giúp người tiếp theo.','Mở quỹ có sổ công khai','Hoàn phần dư cho từng người','bond', ['truth','bond']),
B('Giúp đi lại và giữ việc','Bù bằng công, khó cân lịch','Công ty ghi nhận bạn giữ được một nhân viên. Họ mời bạn tổ chức hỗ trợ dài hạn.','Lập nhóm hỗ trợ đồng nghiệp','Chuyển kinh nghiệm cho người khác','build', ['build','probe'])]),
E('c35','Bằng chứng về người từng hại bạn','{person} gửi bản ghi có thể khiến đối thủ mất chỗ đứng. Bản ghi cũng nhắc một người vô can.','late,rival',[
B('Đưa phần đã xác minh ra ánh sáng','Có công lý, khó kiểm sóng','Người vô can cảm ơn, rồi xin bạn đứng ra sửa một hiểu lầm khác.','Giúp bằng chứng đang có','Giới thiệu người đủ chuyên môn','truth', ['truth','bond']),
B('Gặp đối thủ để đòi sửa sai','Có thể hòa, dễ bị nghi','Đối thủ chịu đính chính và đề nghị hai người cùng làm một việc chung.','Thử hợp tác có giám sát','Nhận đính chính rồi dừng','deal', ['bond','exit']),
B('Giữ bản ghi, giúp người vô can','Bảo vệ người, bỏ dịp trả đũa','Người được giúp trở thành người đứng ra bảo vệ bạn khi lời đồn mới tới.','Cùng lập nhóm kiểm chứng','Giữ sự giúp đỡ kín đáo','care', ['probe','care'])]),
E('c36','Hai chiếc vé về hai hướng','{person} muốn chuyển tới nơi khác sống. Bạn vừa gây dựng được nhóm khách quen.','late,spouse',[
B('Đi cùng, mang nghề theo','Giữ nhau, làm lại mạng lưới','Khách cũ muốn đặt hàng từ xa. Người bạn đời cần thời gian riêng.','Dựng việc từ xa có giờ nghỉ','Tạm thu hẹp việc để ổn nhà','bond', ['build','bond']),
B('Thử sống hai nơi một mùa','Giữ hai lối, tốn đi lại','Nhịp sống thử tới hạn. Hai người đều có những người quen mới.','Chọn một nơi cùng sống','Gia hạn với lịch gặp rõ','deal', ['bond','bond']),
B('Ở lại và nói thật điều mình cần','Giữ gốc, chấp nhận đổi quan hệ','Người ấy gửi một chìa khóa dự phòng. Bạn còn quyền tới thăm.','Đến thăm để nói tiếp','Giữ liên hệ nhưng dựng đời riêng','truth', ['truth','build'])]),
E('c37','Người mua muốn lấy cả tên','{person} mang đề nghị mua công việc bạn dựng nên. Họ muốn cả tên lẫn người làm lâu năm.','late,shop,partner',[
B('Bán để bắt đầu một đời khác','Có vốn, rời thứ quen','Nhân viên cũ tới rủ bạn mở một xưởng nhỏ cùng họ.','Góp nghề vào xưởng mới','Giúp họ rồi giữ thời gian riêng','exit', ['deal','care']),
B('Giữ lại và đào tạo người kế','Giữ tên, gánh chuyển giao','Người kế nhiệm muốn thay sản phẩm nổi tiếng nhất của bạn.','Cho thử một dòng riêng','Giữ sản phẩm cũ làm nền','build', ['bond','build']),
B('Chỉ bán một phần có điều kiện','Có vốn mới, chia quyền','Nhà đầu tư muốn tăng quy mô, nhóm cũ muốn giữ nhịp làm việc.','Mở điểm mới với nhóm tự nguyện','Giữ quy mô đổi chia lợi nhuận','deal', ['build','exit'])]),
E('c38','Tay nghề sau tai nạn','Sau một tai nạn, công việc cũ trở nên khó hơn. {person} mang tới dụng cụ đã được sửa cho bạn.','late,job,mentor',[
B('Học lại cách làm với dụng cụ mới','Giữ nghề, phải kiên nhẫn','Một người khác gặp khó tương tự xin bạn hướng dẫn.','Mở buổi dạy cách thích nghi','Nhận một người học việc','probe', ['care','probe']),
B('Chuyển sang dạy nghề','Giữ kinh nghiệm, xa bàn làm','Học trò muốn dùng tên bạn cho sản phẩm đầu tiên.','Cho tên kèm chuẩn nghề','Khuyến khích họ mang tên riêng','care', ['bond','bond']),
B('Nhận việc hậu trường mới','Có đường khác, mất danh cũ','Việc mới cần người hiểu cả khách lẫn thợ. Bạn được mời điều phối.','Nhận điều phối một dự án','Giữ vai tư vấn theo giờ','build', ['build','bond'])]),
E('c39','Ba bản di chúc','{person} muốn bạn quyết cách chia đồ đạc. Trên bàn có ba bản viết tay, mỗi bản gạch một tên.','old,child',[
B('Chia đều, nói rõ khi còn sống','Rõ phần, chưa chắc rõ lòng','Một người con muốn đổi phần tiền lấy quyền giữ nhà chung.','Mở cuộc họp đổi phần','Giữ phần và lập lịch dùng nhà','truth', ['build','build']),
B('Giữ quỹ cho việc chung','Có di sản, cần người trông','Các con đề nghị dùng quỹ lập một xưởng học nghề mang tên gia đình.','Lập quỹ có người độc lập','Thử một lớp trước','care', ['care','bond']),
B('Chia theo điều mỗi người cần','Có thể đỡ người yếu, dễ so bì','Người nhận ít đề nghị góp công để được phần trong việc chung.','Ghi cả công chăm sóc','Tách quà tặng khỏi di sản','deal', ['care','care'])]),
E('c40','Lời thú nhận còn một nửa','{person} bật máy ghi âm để nghe câu chuyện bạn vẫn tránh. Bạn có thể dừng trước tên cuối cùng.','old,child',[
B('Kể hết với người liên quan','Khép bí mật, làm đau người','Người nghe muốn gặp người còn lại trong câu chuyện.','Giúp họ gặp nhau','Viết rõ phần mình biết','truth', ['care','build']),
B('Viết thư, cho mở sau','Giữ hôm nay, để câu hỏi lại','Người con xin đọc thư khi bạn còn có thể trả lời.','Mở thư cùng nhau','Sửa thư thành lời kể có chứng','probe', ['build','truth']),
B('Kể điều cần sửa ngay trước','Có việc làm, chưa nói hết','Một lời xin lỗi được gửi và có hồi âm muốn gặp bạn.','Đến gặp để nói tiếp','Nhờ người thân chuyển lời','care', ['truth','bond'])]),
E('c41','Chìa khóa căn phòng trọ cũ','{person} tìm thấy chìa khóa nơi bạn từng sống. Chủ mới đang cần một người trông nhà.','adult,friend',[
B('Quay về thuê lại một phòng','Có gốc cũ, đổi lịch sống','Người ở mới muốn cùng làm một bữa cơm cho tất cả người từng thuê.','Tổ chức bữa cơm ký ức','Gom chuyện thành cuốn sổ','bond', ['deal','bond']),
B('Dùng chỗ ấy làm lớp nhỏ','Có việc ý nghĩa, gánh tiền thuê','Lớp đông lên. Chủ nhà muốn tăng giá vì thấy bạn có khách.','Thương lượng quỹ thuê chung','Chuyển lớp sang chỗ công cộng','build', ['deal','bond']),
B('Trả chìa khóa, xin giữ câu chuyện','Khép chỗ cũ, mở một cuộc gặp','Chủ mới gửi bạn những bức thư không người nhận trong tủ.','Tìm người nhận thư','Giao thư cho kho lưu trữ','probe', ['probe','bond'])]),
E('c42','Người học việc giỏi hơn thầy','{person} sửa được thứ bạn đã bỏ dở ba lần. Khách hỏi thẳng tên người học việc.','adult,job,mentor',[
B('Đưa người ấy ra trước khách','Có người kế, bớt hào quang','Người ấy được mời đi riêng, muốn mang theo một nửa nhóm.','Giúp chia nhóm tử tế','Thử hợp tác hai xưởng','care', ['deal','bond']),
B('Rủ góp thành đối tác','Có sức mới, phải chia quyền','Đối tác trẻ muốn đổi cách báo giá. Khách cũ chưa quen.','Thử giá mới với khách mới','Giữ hai dòng dịch vụ','deal', ['bond','bond']),
B('Xin học lại chính kỹ thuật ấy','Mất vai thầy, có tay nghề mới','Hai người được mời cùng dạy một lớp, nhưng chỉ có một chỗ đứng tên.','Đòi hai tên ngang nhau','Nhận vai trợ giảng lần này','probe', ['defy','bond'])]),
E('c43','Ngôi nhà cho người lạ ở nhờ','{person} xin gửi một người đang tìm việc vào phòng trống của bạn. Họ chỉ xin mười đêm.','adult,home,neighbor',[
B('Cho ở, ghi rõ ngày hẹn','Giúp được người, đổi riêng tư','Người ở nhờ tìm được việc và muốn góp tiền thuê lâu dài.','Thử sống chung có lịch','Giúp tìm phòng gần đó','care', ['bond','probe']),
B('Rủ họ đổi công lấy phòng','Có tay sửa nhà, thành chủ thuê','Căn nhà sửa xong, người ấy có khách riêng muốn làm nghề ở sân.','Cho thuê một góc sân','Giới thiệu chỗ làm độc lập','deal', ['build','build']),
B('Tìm một nhóm hỗ trợ chỗ ở','Chia trách nhiệm, cần điều phối','Nhóm muốn bạn giữ danh sách chỗ trống trong khu.','Nhận điều phối theo mùa','Giao danh sách cho tổ dân cư','bond', ['build','bond'])]),
E('c44','Hội nhóm có hai người','{person} rủ lập hội vì cả khu không ai chịu bắt đầu. Buổi đầu chỉ có hai chiếc ghế.','adult,neighbor',[
B('Giữ hẹn dù chỉ hai người','Có nếp, cần bền lòng','Hội đông lên, một thành viên muốn thu phí để thuê chỗ đẹp.','Thử quỹ đóng tự nguyện','Giữ buổi miễn phí ở sân','bond', ['care','deal']),
B('Đăng một buổi biểu diễn công khai','Có người xem, dễ làm quá','Buổi diễn được mời sang nơi khác nhưng họ muốn đổi nội dung.','Giữ một phần nội dung gốc','Tự tổ chức buổi tiếp','show', ['bond','build']),
B('Gắn hội với một việc giúp xóm','Có ích ngay, ít giờ chơi','Xóm muốn giao hội một công việc hằng tháng, có khoản trả.','Nhận bằng lịch tự nguyện','Giữ hội khỏi thành dịch vụ','build', ['bond','bond'])]),
E('c45','Hàng rào lệch một gang','{person} đặt lại hàng rào sau đợt sửa nhà. Luống cây bạn trồng nằm sang phía bên kia.','adult,home,neighbor',[
B('Đo lại cùng hàng xóm','Rõ ranh, có thể mất cây','Đo xong, hai nhà phát hiện lối thoát chung bị bịt từ trước.','Cùng mở lại lối đi','Nhờ người kiểm tra ranh chung','probe', ['build','probe']),
B('Đổi đất lấy lối đi chung','Mất một phần, có đường lâu','Lối đi đông người, xóm xin dùng làm đường chở hàng.','Đặt giờ dùng rõ','Giữ lối cho hai nhà','deal', ['bond','bond']),
B('Rủ biến ranh thành vườn chung','Có sân chung, phải chăm cùng','Cây ra trái. Hai nhà bất đồng chuyện chia cho khách.','Đặt giỏ tự lấy trước cửa','Chia theo công chăm mỗi mùa','bond', ['bond','deal'])]),
E('c46','Lời mời làm chứng muộn','{person} muốn bạn kể điều thấy từ nhiều năm trước. Người bị ảnh hưởng giờ là khách tốt nhất của bạn.','adult,job,friend',[
B('Kể đúng phần đã thấy','Giữ lời mình, mất khách','Khách dừng mua, nhưng người được minh oan muốn giới thiệu nhóm khách mới.','Nhận giới thiệu công khai','Tự tìm khách để giữ khoảng cách','truth', ['truth','exit']),
B('Tìm lại hồ sơ trước khi kể','Có căn cứ, trễ một nhịp','Hồ sơ cho thấy bạn nhớ sai một chi tiết quan trọng.','Đính chính trước mọi người','Nộp bản ghi cùng lời giải thích','probe', ['truth','truth']),
B('Xin gặp cả hai bên','Có thể hiểu nhau, dễ chịu sức ép','Hai bên muốn nhờ bạn giữ vật chứng còn lại, nhưng chỉ chịu ký hai bản giao khác nhau.','Bàn giao cho nơi lưu giữ','Giữ bản sao cho cả hai','deal', ['bond','bond'])]),
E('c47','Công thức viết trên khăn ăn','{person} tìm thấy công thức bạn từng đùa. Một khách lạ trả tiền để ăn thử.','adult,friend',[
B('Làm mẻ đầu để bán','Có cơ hội nghề, tốn công thử','Mẻ đầu có người đặt lại, nhưng họ chỉ muốn mua phần công thức.','Bán sản phẩm giữ công thức','Cho dùng công thức có thời hạn','build', ['deal','bond']),
B('Dạy bạn cùng làm','Có đồng đội, chia điều riêng','Người bạn làm phiên bản ngon hơn và xin bán dưới tên chung.','Chung tên chia công rõ','Giữ hai phiên bản cạnh nhau','bond', ['deal','bond']),
B('Mở một buổi nấu cho xóm','Có tiếng cười, chưa có doanh thu','Buổi nấu trở thành lịch hẹn, vài người muốn trả phí học.','Mở lớp tự nguyện','Giữ một bữa cộng đồng','show', ['build','bond'])]),
E('c48','Chức tổ trưởng bất đắc dĩ','{person} ghi tên bạn vào cuộc bầu chọn vì mọi người tưởng bạn đã nhận. Bạn thắng đúng một phiếu.','adult,neighbor',[
B('Nhận thử một nhiệm kỳ ngắn','Có quyền làm, gánh việc chung','Việc đầu ổn, nhưng người đề cử bạn muốn được miễn đóng quỹ.','Áp lệ đã công khai','Mở họp xét hoàn cảnh từng hộ','defy', ['truth','build']),
B('Đề nghị chia vai cho ba người','Nhẹ gánh, chậm thống nhất','Một người bỏ vai giữa chừng, hai người còn lại có cách làm khác nhau.','Bầu người thay công khai','Tách việc để cùng tiếp tục','deal', ['truth','bond']),
B('Từ chối ghế, nhận một dự án','Giữ thời gian, làm việc cụ thể','Dự án xong sớm, tổ mới muốn bạn làm người kiểm quỹ.','Nhận kiểm quỹ theo kỳ','Dạy người khác cách kiểm','exit', ['probe','probe'])]),
E('c49','Tờ báo viết sai về bạn','{person} đưa bài báo ca ngợi việc bạn chưa từng làm. Người thật sự làm đang ngồi cạnh.','adult,friend',[
B('Đính chính và nhường tên','Giữ sự thật, hụt hào quang','Tòa soạn muốn làm bài về cả hai, hỏi ai đã nghĩ việc đầu tiên.','Kể rõ từng phần công','Đưa người làm thật lên tiếng','truth', ['truth','build']),
B('Mời người làm thật cùng xuất hiện','Chia ánh sáng, cần thống nhất','Hai bạn được mời nhận dự án cộng đồng, nhưng chỉ một người được trả lương.','Chia tiền theo công việc','Đòi hai hợp đồng rõ','bond', ['deal','deal']),
B('Dùng sự chú ý để gọi người hỗ trợ','Có nguồn lực, dễ bị hiểu lầm','Nhóm mới hỏi ai là người quyết định cuối cùng.','Giao quyền cho người có nghề','Lập nhóm quyết định luân phiên','build', ['bond','build'])]),
E('c50','Bức ảnh cả nhà thiếu một người','{person} tìm thấy ảnh gia đình có một khoảng bị cắt. Không ai muốn giải thích chiếc ghế trống.','late,sibling',[
B('Đi tìm người bị cắt khỏi ảnh','Mở chuyện cũ, có thể tìm họ','Người ấy còn giữ nửa ảnh kia và muốn tới một bữa cơm.','Tổ chức cuộc gặp nhỏ','Gặp riêng trước khi mời nhà','probe', ['build','bond']),
B('Hỏi từng người rồi viết lại','Có nhiều lời kể, khó chọn tin','Cuốn sổ đầy lên, hai người trong nhà xin sửa cùng một trang.','Giữ cả hai lời kể','Thêm tài liệu để đối chiếu','truth', ['bond','probe']),
B('Đặt chiếc ghế trống trong bữa tới','Gợi lời nói, không ép tên','Một người lớn tuổi ngồi cạnh ghế và bắt đầu kể.','Ghi lại khi được đồng ý','Nghe riêng không ghi âm','care', ['bond','bond'])]),
];
