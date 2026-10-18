import { E, B, type Fork } from './kit.ts';
export const MONEY_FORKS: Fork[] = [
E('m01','Tấm vé trong chiếc ví cũ','{person} tìm thấy vé dự thưởng chưa nhận trong ví nhà bạn. Mặt sau có một tên khác viết mờ.','adult,money,friend',[
B('Tìm đúng chủ trước khi nhận','Rõ phần, có thể mất giải','Chủ vé muốn chia phần để cùng mở quầy nhỏ, nhưng chưa có ai giữ sổ.','Góp phần bằng giấy rõ','Nhận phần rồi đi việc riêng','probe', ['deal','bond']),
B('Nhờ đơn vị phát hành xác minh','Có căn cứ, giải gần hết hạn','Vé được xác nhận thuộc bạn, vài người quen đã biết tin và hỏi vay.','Đặt giới hạn khoản giúp','Giữ quỹ dự phòng riêng','truth', ['exit','care']),
B('Đề nghị cùng chia khi làm rõ','Có đồng minh, phải chờ kết quả','Người có tên trên vé nhận lời và muốn dành phần chung cho một việc tưởng niệm.','Lập phần quỹ minh bạch','Chia phần rồi tự quyết','deal', ['truth','deal'])]),
E('m02','Khoản chuyển nhầm lúc hết tiền','{person} báo một khoản lạ vừa vào tài khoản bạn. Tiền thuê nhà tới hạn trong chiều nay.','adult,money,friend',[
B('Báo hoàn theo kênh xác minh','Giữ an tâm, vẫn thiếu tiền thuê','Chủ khoản tiền cảm ơn và biết bạn có đúng tay nghề họ đang cần.','Nhận việc bằng hợp đồng riêng','Giữ việc hoàn tiền độc lập','truth', ['deal','bond']),
B('Giữ nguyên tiền, nhờ kiểm tra','Có chứng từ, chờ xử lý','Việc được giải quyết, bạn được mời chia sẻ cách giữ sổ cho nhóm làm tự do.','Giúp dựng mẫu sổ','Chỉ chia bản hướng dẫn','probe', ['care','deal']),
B('Nhờ chủ nhà gia hạn trong lúc hoàn','Giữ nghĩa, lộ khó khăn','Chủ nhà đồng ý nhưng muốn bạn giúp sửa một phần nhà thay tiền chậm.','Thỏa thuận công thay tiền','Trả đủ rồi giữ hợp đồng cũ','deal', ['deal','deal'])]),
E('m03','Di sản có một điều kiện','{person} chuyển di chúc của người chú xa. Bạn được phần tiền nếu tiếp tục chăm khu vườn ông để lại.','adult,money,sibling',[
B('Nhận phần và chăm khu vườn','Có vốn, gánh việc lâu','Vườn có quả, người từng chăm muốn bán sản phẩm dưới tên của chú.','Hợp tác chia công rõ','Giữ vườn làm chỗ gia đình','build', ['deal','build']),
B('Nhường cho người chăm được','Giữ tự do, giữ một ân tình','Người nhận phần nhờ bạn mở đường bán hàng vì vườn đang vào mùa.','Giúp bán theo từng lô','Chỉ giới thiệu người mua','care', ['deal','bond']),
B('Xin lập nhóm cùng giữ vườn','Chia trách nhiệm, chậm quyết','Nhóm muốn xây một gian bán hàng nhưng mỗi nhà muốn góp khác nhau.','Góp theo phần dùng thực','Thử quầy tạm trước','deal', ['deal','bond'])]),
E('m04','Đất nhà có vật liệu quý','{person} đưa kết quả khảo sát: đất của bạn có loại vật liệu một công ty muốn khai thác.','adult,money,land,neighbor',[
B('Xin thẩm định và điều kiện phục hồi','Có căn cứ, chậm ký','Bản thẩm định làm giá đề nghị đổi. Công ty muốn bạn đại diện thêm các hộ.','Nhận đại diện có giám sát','Chỉ ký phần đất của mình','probe', ['bond','deal']),
B('Cho thuê có giới hạn diện tích','Có thu, phải giám sát','Bên thuê muốn mở rộng khi gặp lớp vật liệu tốt hơn.','Kiểm lại tác động trước','Giữ ranh đã ký','deal', ['probe','exit']),
B('Giữ đất, tìm cách dùng khác','Giữ nơi sống, bỏ khoản lớn','Một nhóm nghiên cứu muốn thuê khảo sát mà không khai thác.','Thử hợp tác khảo sát','Giữ đất cho sinh hoạt cũ','exit', ['probe','bond'])]),
E('m05','Tiền thắng kiện muộn','{person} báo khoản bồi thường từ vụ việc bạn tưởng đã hết hy vọng. Người thua kiện vẫn sống cạnh nhà.','adult,money,neighbor',[
B('Nhận tiền sửa thiệt hại cũ','Khép phần mất, còn quan hệ','Sửa xong, người hàng xóm muốn cùng làm lại đoạn hàng rào gây tranh chấp.','Cùng làm với ranh rõ','Giữ ranh độc lập','build', ['build','exit']),
B('Đề nghị nhận theo kỳ có bảo đảm','Dễ thu hơn, phải chờ','Người trả đúng kỳ đầu rồi xin đổi kỳ sau bằng công việc.','Định giá công minh bạch','Giữ lịch tiền đã ký','deal', ['deal','bond']),
B('Dành một phần hòa giải khu xóm','Có người hưởng, cần giữ sổ','Quỹ nhỏ có người xin dùng vào tranh chấp mới.','Đặt tiêu chí trước khi chi','Hoàn phần chưa dùng','care', ['bond','bond'])]),
E('m06','Đàn vịt được đặt cọc hai lần','{person} báo hai người đều nhận mình đã cọc đàn vật nuôi của nhà bạn. Cả hai mang giấy.','adult,money,partner',[
B('Đối chiếu sổ và hoàn phần sai','Giữ tiếng, có thể mất khách','Người được hoàn muốn đặt mua mùa sau nhưng cần người chứng kiến.','Nhận đơn có xác nhận chung','Giới thiệu trại khác','truth', ['build','bond']),
B('Chia lô nếu hai bên đồng ý','Giữ hai khách, tăng công giao','Hai khách muốn bạn gom sản phẩm của các hộ khác để đủ đơn.','Lập nhóm giao theo sổ','Giữ quy mô một nhà','deal', ['build','exit']),
B('Hủy bán, chuyển sang sản phẩm đều','Giữ đàn, phải tìm đầu ra','Một cửa hàng hỏi mua theo tuần, không mua cả đàn.','Nhận hợp đồng tuần thử','Bán tại chỗ theo khả năng','build', ['deal','deal'])]),
E('m07','Bức tranh ở gác xép','{person} dẫn một người mua tranh tới. Họ trả giá cao cho bức vẽ gia đình vẫn dùng che vết nứt.','adult,money,sibling',[
B('Xin thẩm định trước khi bán','Rõ giá, có thể mất khách','Tranh có giá trị riêng, người thẩm định muốn bạn tìm hồ sơ người vẽ.','Tìm lịch sử bức tranh','Bán sau khi có chứng nhận','probe', ['probe','deal']),
B('Bán với quyền giữ bản sao','Có vốn, vắng một kỷ vật','Người mua mời gia đình tới xem tranh trong gian trưng bày mới.','Kể chuyện cho gian tranh','Giữ cuộc gặp riêng trong nhà','deal', ['truth','bond']),
B('Cho mượn triển lãm theo kỳ','Giữ tranh, phải trông hợp đồng','Triển lãm có khách muốn mua quyền in bản, gia đình chưa thống nhất.','Họp nhà quyết quyền in','Chỉ giữ hợp đồng mượn','care', ['bond','exit'])]),
E('m08','Đền bù cao hơn dự tính','{person} đưa bảng giá đền bù mới. Khoản nhận đủ đổi nơi ở, nhưng tiền tới từng đợt.','adult,money,home,neighbor',[
B('Lập quỹ chuyển nhà từng đợt','Có kế hoạch, phải kiên nhẫn','Một chỗ ở tốt yêu cầu đặt cọc trước khi đợt tiền cuối về.','Thương lượng cọc theo tiến độ','Chọn chỗ nhỏ đã đủ tiền','probe', ['deal','bond']),
B('Góp mua chung với vài hộ','Giữ xóm, chia rủi ro','Nhóm chọn được đất nhưng cần người giữ tiền chung.','Dùng tài khoản và kiểm chéo','Tách từng phần mua riêng','deal', ['probe','deal']),
B('Thuê trước để thử nơi mới','Có thời gian chọn, mất tiền thuê','Bạn tìm thấy việc hợp ở nơi thuê, người bán muốn thương lượng mua dần.','Xem hợp đồng mua phù hợp','Tiếp tục thuê giữ linh hoạt','exit', ['deal','build'])]),
E('m09','Hụi vỡ, người giữ là cô ruột','{person} nói vòng góp tiền đã ngừng trả. Người đứng ra giữ quỹ là một người trong họ.','adult,money,vn,sibling',[
B('Cùng mọi người đối chiếu phần góp','Có căn cứ, khó giữ hòa','Sổ làm rõ khoản còn lại. Một số người muốn bạn đại diện thương lượng.','Nhận đại diện có biên bản','Giao hồ sơ cho người có nghề','probe', ['bond','truth']),
B('Đòi phần mình qua kênh chính thức','Giữ quyền, chịu tiếng nhà','Người họ hàng xin trả bằng một tài sản phải kiểm nguồn gốc.','Thẩm định trước khi nhận','Giữ lịch tiền đã xác nhận','truth', ['bond','bond']),
B('Giúp nhóm xoay sinh kế khác trước','Có đường sống, việc đòi còn đó','Nhóm bán hàng nhỏ có khách, muốn dùng lời lãi theo đuổi khoản cũ.','Tách quỹ kinh doanh và đòi nợ','Chia lời cho từng người tự quyết','build', ['care','deal'])]),
E('m10','Bạn cầm quỹ chung biến mất','{person} không liên lạc được người giữ quỹ. Tiền thuê địa điểm của cả nhóm tới hạn.','adult,money,partner',[
B('Lập hồ sơ và thông báo đúng người','Giữ dấu vết, tạm dừng việc','Có tin về người giữ quỹ. Nhóm muốn bạn đi gặp cùng người đại diện.','Gặp qua kênh có chứng','Giữ vai cung cấp sổ','probe', ['bond','bond']),
B('Thu hẹp việc để giữ nhóm','Có việc tiếp, chịu mất trước','Nhóm sống được với quầy nhỏ, khách cũ muốn đặt đơn lớn trở lại.','Tăng từng đợt có dự phòng','Giữ quầy nhỏ chia lời đều','build', ['bond','deal']),
B('Chia rõ phần còn lại rồi tách','Giữ ranh, mất việc chung','Một người trong nhóm muốn làm riêng với bạn vì tin cách chia phần.','Thử hợp tác có sổ đôi','Giữ quan hệ giới thiệu khách','exit', ['bond','bond'])]),
E('m11','Cửa ngân hàng đóng buổi sáng','{person} đứng cùng hàng người trước nơi gửi tiền. Biển thông báo chỉ nói hẹn ngày làm việc sau.','adult,money,deposit,friend',[
B('Giữ hồ sơ, theo kênh xác nhận','Có chứng, phải chờ','Nhóm gửi tiền muốn gom câu hỏi và cử người làm việc chính thức.','Góp hồ sơ có bản sao','Tự theo phần của mình','probe', ['deal','deal']),
B('Điều chỉnh chi để giữ tiền mặt','Có thời gian, giảm tiện nghi','Sau đợt thắt chi, gia đình đề nghị giữ nếp sống mới lâu hơn.','Giữ phần tiết kiệm hợp sức','Khôi phục khoản vui quan trọng','exit', ['bond','bond']),
B('Rủ người quen đổi công thay chi','Có hỗ trợ, phải trả công sau','Nhóm đổi công hoạt động tốt, có người muốn quy thành khoản nợ tiền.','Giữ sổ giờ được đồng ý','Khép nhóm sau giai đoạn khó','bond', ['bond','exit'])]),
E('m12','Bảo hiểm hỏi chiếc bình chữa cháy','{person} mang yêu cầu bổ sung hồ sơ sau hỏa hoạn. Một bức ảnh có thể chứng minh phần bạn khai.','adult,money,shop,partner',[
B('Tìm ảnh và làm hồ sơ thật','Có cơ sở, mất công chờ','Được chi trả một phần, bạn phải chọn sửa máy cũ hay đổi dây chuyền.','Sửa máy có kiểm an toàn','Đổi một công đoạn trước','probe', ['probe','bond']),
B('Đàm phán tạm ứng phần rõ ràng','Có tiền sửa, chốt một phần','Xưởng chạy lại, khách muốn biết bạn đã thay quy trình gì.','Cho kiểm quy trình mới','Giữ đơn nhỏ trong khi sửa','deal', ['probe','bond']),
B('Thuê xưởng khác giữ đơn hàng','Có thu tiếp, trả phí đều','Xưởng cho thuê muốn gộp thương hiệu, nhóm cũ chưa đồng ý.','Chia thương hiệu theo dòng','Giữ thuê máy không gộp tên','build', ['deal','build'])]),
E('m13','Con ký khoản vay khó hiểu','{person} đặt điện thoại trước mặt bạn. Khoản trả đã lớn hơn số tiền người ấy thực nhận.','late,money,child',[
B('Cùng con xác minh và thu xếp','Có người đỡ, phải mở hết sổ','Khoản vay rõ dần, con xin tự quản phần trả bằng việc mới.','Giữ lịch con tự chịu trách nhiệm','Chia một phần theo sức mỗi người','care', ['care','deal']),
B('Tìm người hỗ trợ chuyên môn','Có căn cứ, chuyện phải công khai','Bản đối chiếu lộ một khoản sai. Con muốn kể lại để giúp bạn khác.','Kể phần đã kiểm chứng','Giữ hồ sơ dùng khi cần','probe', ['probe','truth']),
B('Giúp con kiếm việc trả dần','Có kỹ năng, cần thời gian','Con tìm được việc nhưng muốn bỏ nghề đang học để nhận thêm ca.','Giữ học cùng lịch trả','Điều chỉnh kỳ trả trước','build', ['probe','bond'])]),
E('m14','Mẹ đưa tiền cho hội lạ','{person} muốn góp thêm tiền vào một nhóm hứa chăm sóc tuổi già. Tài liệu chỉ có ảnh và khẩu hiệu.','adult,money,mother',[
B('Cùng mẹ đi hỏi giấy tờ','Có sự thật, dễ chạm tự ái','Mẹ bắt đầu đặt câu hỏi và muốn bạn giúp tìm nhóm sinh hoạt khác.','Tìm nhóm có người quen','Giữ một lịch gặp mẹ đều','probe', ['probe','bond']),
B('Thu xếp một cách chăm thực tế','Có phương án, tốn công đều','Mẹ thích lịch mới, hàng xóm xin cùng tham gia và chia chi phí.','Lập nhóm chăm có sổ','Giữ lịch riêng cho gia đình','care', ['care','bond']),
B('Mời người mẹ tin cùng nói chuyện','Có người nghe, phải nhờ thêm','Người ấy giúp mẹ dừng góp nhưng muốn bạn thay vai điều phối hội cũ.','Chỉ giúp phần minh bạch hóa','Giữ khoảng cách với hội','bond', ['truth','exit'])]),
E('m15','Bạn đời dùng quỹ nhà đầu tư','{person} cho bạn xem bảng đầu tư vừa giảm mạnh. Tiền đã dùng gồm cả khoản hai người định sửa nhà.','adult,money,spouse',[
B('Cùng cắt rủi ro và mở sổ','Rõ tiền, phải nhận phần mất','Quỹ nhà dần có lại, người ấy muốn đầu tư một khoản nhỏ có giới hạn.','Đặt trần khoản tự quyết','Giữ quỹ nhà tách riêng','truth', ['defy','care']),
B('Tách quỹ cá nhân và quỹ chung','Có ranh, dễ thấy xa nhau','Một khoản chi gia đình lớn tới, hai người phải quyết phần góp mới.','Chia theo thu nhập hiện tại','Lập quỹ mục tiêu theo kỳ','deal', ['deal','care']),
B('Giữ khoản chung, cùng học lại','Có nền hiểu, chưa sửa ngay','Hai người thấy cách quản tiền khác nhau và muốn thử sổ chung một mùa.','Thử sổ đôi cùng đối chiếu','Giữ lịch trao đổi mỗi tháng','probe', ['probe','bond'])]),
E('m16','Khoản thuế từ sổ cũ','{person} báo hồ sơ những năm trước cần đối chiếu. Người giữ sổ cũ đã nghỉ việc.','adult,money,job,boss',[
B('Thuê người rà hồ sơ thật','Có căn cứ, trả phí kiểm','Hồ sơ sửa xong, người làm cũ muốn quay lại giúp dựng hệ thống mới.','Nhận với kiểm chéo rõ','Thuê người độc lập lâu dài','probe', ['probe','build']),
B('Đề nghị lịch xử lý theo kỳ','Giữ dòng tiền, mang lịch hẹn','Lịch kỳ đầu đúng, khách lớn đề nghị trả trước để giữ chỗ sản xuất.','Nhận đặt trước có giới hạn','Giữ lịch giao theo sức','deal', ['exit','deal']),
B('Thu gọn việc để làm sạch sổ','Có nền mới, mất vài khách','Khách cũ quay lại vì tin cách bạn xử lý lỗi, nhưng đơn hàng họ muốn lớn hơn sức nhóm hiện tại.','Nhận lại từng đơn rõ giấy','Giữ quy mô đã kiểm được','truth', ['bond','exit'])]),
E('m17','Chuyến hàng Tết của cả họ','{person} gom tiền đặt một lô hàng mùa lễ. Bạn được mời góp phần và đứng ra bán.','adult,money,vn,sibling',[
B('Góp nhỏ và thử một lô','Có cơ hội, giới hạn vốn','Lô đầu bán hết, cả họ muốn tăng gấp nhiều lần trước hạn giao.','Tăng theo đơn đã đặt cọc','Giữ lô bằng sức bán','build', ['bond','bond']),
B('Nhận bán, không giữ tiền góp','Có thu từ công, ít quyền hàng','Người góp muốn bạn chịu phần hàng tồn vì chọn mẫu.','Thương lượng trách nhiệm đã ghi','Chỉ tiếp tục đơn có đặt trước','deal', ['deal','bond']),
B('Làm sổ đặt trước cho cả nhóm','Có dữ liệu, phải chờ khách','Đơn đặt đủ, một hộ muốn ưu tiên họ hàng không có cọc.','Giữ thứ tự đã xác nhận','Dành một phần hàng dự phòng','probe', ['bond','bond'])]),
E('m18','Tiệm rẻ vì chủ vắng mặt','{person} giới thiệu tiệm bán gấp. Người thân của chủ nói giấy ủy quyền đang được bổ sung.','adult,money,partner',[
B('Kiểm quyền bán trước khi đặt','Rõ tài sản, dễ lỡ giá','Giấy tờ rõ, nhưng nhân viên cũ muốn được giữ việc sau khi bán.','Nhận tiệm với lịch thử','Đề nghị họ cùng góp công','probe', ['bond','deal']),
B('Thuê vận hành thử có giấy','Có doanh thu, chưa sở hữu','Tiệm có lãi, chủ muốn tăng giá mua vì bạn làm tốt.','Đàm phán dựa hợp đồng thử','Giữ thuê hoặc chuyển chỗ','build', ['deal','build']),
B('Giúp người bán tìm khách phù hợp','Có quan hệ, bỏ món rẻ','Người mua mới muốn thuê bạn quản lý vì đã hiểu tiệm.','Nhận quản theo nhiệm kỳ','Giữ vai giới thiệu độc lập','bond', ['build','bond'])]),
E('m19','Phiên đấu giá vượt túi tiền','{person} rủ bạn góp vào một tài sản đấu giá. Bảng giá vừa vượt số nhóm dự tính.','adult,money,partner',[
B('Dừng ở trần vốn đã chốt','Giữ tiền, lỡ món hàng','Người thắng thiếu phần thanh toán, muốn bán lại một phần cho bạn.','Kiểm giấy trước khi xem giá','Giữ vốn tìm món khác','exit', ['probe','probe']),
B('Tìm người góp thêm minh bạch','Có sức mua, chia quyền','Nhóm đủ vốn nhưng người góp cuối muốn quyền quyết lớn nhất.','Chia quyền theo thỏa thuận trước','Rút phần mình trước khi ký','deal', ['deal','exit']),
B('Chuyển sang tài sản nhỏ hơn','Có việc làm, bớt hào quang','Món nhỏ tạo nguồn thu đều, đối tác muốn ghép thêm ba món tương tự.','Mở từng bước theo dòng tiền','Giữ một món dễ quản','build', ['build','bond'])]),
E('m20','Người mua công nghệ ở quán cà phê','{person} đưa lời đề nghị mua thứ bạn tự chế. Họ cần câu trả lời trước khi ly cà phê nguội.','adult,money,partner',[
B('Xin thời gian định giá và quyền dùng','Có căn cứ, có thể mất người mua','Một khách khác xuất hiện, cả hai muốn độc quyền ở hai lĩnh vực khác nhau.','Tách quyền theo phạm vi','Chọn một hợp đồng dễ giữ','probe', ['bond','deal']),
B('Đề nghị cùng làm thử một sản phẩm','Có thị trường, chia quyền','Mẫu thử có người mua, đối tác muốn bạn tuyển đội thay vì tự chế.','Lập nhóm với vai rõ','Giữ xưởng thử nhỏ','build', ['build','bond']),
B('Bán quyền có thời hạn','Có tiền, còn lối quay lại','Hợp đồng sắp hết, người mua xin gia hạn và thêm quyền sửa thiết kế.','Thương lượng phần quyền mới','Lấy lại thiết kế tự dùng','deal', ['deal','bond'])]),
E('m21','Đối thủ rủ góp căn nhà','{person} đề nghị cùng góp tài sản vào một vụ lớn. Mỗi người phải đặt thứ mình khó bỏ nhất.','adult,money,home,rival',[
B('Chỉ góp phần có thể mất','Có cửa tham gia, bớt phần lời','Vụ đầu có lời nhỏ, đối thủ muốn bạn tăng phần để cùng nắm quyền.','Tăng sau khi kiểm đủ sổ','Giữ trần phần đã chọn','deal', ['probe','bond']),
B('Đòi một dự án thử trước','Có chứng, bị coi thiếu gan','Dự án thử lộ cách hai người xử lý tiền khác nhau.','Sửa luật chia và kiểm','Giữ hai việc độc lập','probe', ['deal','bond']),
B('Giữ nhà, mở việc cạnh tranh','Có đường riêng, giữ cuộc đấu','Khách của đối thủ hỏi mua của bạn, muốn mang theo thông tin riêng bên kia.','Nhận khách không lấy bí mật','Giữ khách tự tìm mình','build', ['bond','probe'])]),
E('m22','Kho chôn trong tờ bản đồ','{person} tìm bản đồ của ông. Chi phí khảo sát đủ sửa mái nhà, còn dấu X nằm dưới cây cũ.','adult,money,sibling',[
B('Khảo sát nhỏ trước khi bỏ vốn','Có căn cứ, mất bí ẩn','Chưa có kho, nhưng nền cũ có giá trị nghiên cứu. Một nhóm muốn tới xem.','Mời nhóm với quyền giữ rõ','Giữ nền cho gia đình','probe', ['bond','bond']),
B('Biến thành chuyến đi gia đình','Có kỷ niệm, không hứa vàng','Chuyến đi tìm lại người từng sống cạnh ông, họ giữ một nửa câu chuyện.','Gặp để nối lời kể','Viết lại chuyến đi cho nhà','bond', ['bond','build']),
B('Dùng tiền sửa nhà trước','Có mái chắc, để giấc mơ chờ','Khi sửa mái, thợ tìm được hộp đồ không đáng tiền nhưng đầy thư.','Tìm chủ những lá thư','Giữ hộp làm tủ kỷ niệm','exit', ['probe','build'])]),
E('m23','Giấy đất còn tên người xưa','{person} muốn mua phần đất của bạn. Hồ sơ quyền sử dụng đã có, nhưng bản giấy vẫn chờ cập nhật tên.','adult,money,vn,land,neighbor',[
B('Hoãn bán tới khi đủ giấy','Giữ quyền, chậm nhận vốn','Khách chịu chờ nhưng muốn được thuê dùng đất trước.','Lập hợp đồng thuê riêng','Giữ đất trống tới ngày bán','probe', ['deal','bond']),
B('Xin đặt cọc có điều kiện rõ','Có phần vốn, phải giữ hạn','Giấy tờ lâu hơn dự kiến, người mua muốn thương lượng lại lịch.','Gia hạn bằng văn bản','Hoàn cọc theo điều đã ký','deal', ['bond','deal']),
B('Giữ đất làm việc khác trước','Có nguồn sống, bỏ giá nóng','Một nhóm muốn trồng rau theo mùa, người mua cũ xin góp vốn.','Thử việc chung nhỏ','Giữ vai chủ cho thuê','build', ['build','build'])]),
E('m24','Người mua trả công bằng gia vị','{person} muốn trả một đơn hàng bằng số gia vị đang tồn kho. Nhà bạn chỉ còn chỗ cho bàn ăn hoặc một trăm thùng.','adult,money,friend',[
B('Bán lại qua người phân phối','Có tiền, chia chiết khấu','Người phân phối muốn bạn làm điểm nhận đơn cho khu.','Thử nhận đơn giới hạn','Bán hết rồi khép việc','deal', ['exit','exit']),
B('Mở bếp theo đơn đặt trước','Có nghề mới, mất giờ nghỉ','Bếp có khách thường, gia đình muốn bạn thuê chỗ riêng.','Thuê khi đủ đơn đều','Giữ bếp nhỏ vài ngày tuần','build', ['build','bond']),
B('Đổi lấy hàng thiết yếu cho nhóm','Có mạng trợ giúp, cần kiểm phần','Nhóm muốn giữ mạng đổi hàng sau khi kho giải đã hết.','Lập sổ trao đổi tự nguyện','Chuyển mạng cho tổ cộng đồng','care', ['build','bond'])]),
E('m25','Vé đi xa đặt nhầm điểm đến','{person} phát hiện bạn đặt nhầm thành phố. Vé khó hoàn, còn kỳ nghỉ sắp tới.','adult,money,friend',[
B('Đi và tìm một trải nghiệm nghề','Có chuyện mới, thêm chi phí','Bạn gặp xưởng dùng kỹ thuật mình muốn học. Họ mời trở lại một mùa.','Xin điều kiện học việc rõ','Mang ghi chép về nghề cũ','probe', ['probe','probe']),
B('Đổi vé với phần phí hợp lý','Giữ kế hoạch, chịu phí','Công ty vé muốn bạn thử công cụ kiểm lịch mới sau lời góp ý cụ thể.','Thử rồi phản hồi có giới hạn','Nhận vé đúng và dừng','deal', ['exit','exit']),
B('Giữ tiền sinh hoạt, bỏ chuyến','Giữ nền, lỡ cuộc đi','Thời gian ở nhà giúp bạn hoàn tất một việc bán được cho khách.','Nhận làm tiếp dòng ấy','Dành phần lời cho chuyến sau','exit', ['build','bond'])]),
E('m26','Điện được tính nhầm nhiều năm','{person} mang bản đối chiếu: nhà bạn đã trả thừa qua nhiều kỳ. Hồ sơ cần chữ ký các hộ.','adult,money,home,neighbor',[
B('Theo hồ sơ đòi đúng phần','Có tiền về, mất thời gian','Các hộ nhờ bạn kiểm một khoản phí khác trong khu.','Giúp đối chiếu theo buổi','Chuyển mẫu cho từng hộ tự làm','probe', ['probe','bond']),
B('Gom hồ sơ chung với xóm','Có sức nhóm, phải giữ tin','Khoản hoàn tới, nhóm bất đồng cách chia phí đã góp làm hồ sơ.','Theo sổ công đã ghi','Mời người độc lập kiểm phần','bond', ['bond','probe']),
B('Đổi khoản hoàn thành tín dụng hóa đơn','Nhẹ chi sau, không có tiền ngay','Chi sinh hoạt giảm, bạn có thể sửa thiết bị cũ hao điện.','Sửa theo khoản thật tiết kiệm','Giữ phần dư làm dự phòng','deal', ['build','build'])]),
E('m27','Người buôn xin thuê sân nhà','{person} đang cần chỗ giữ lô thiết bị vệ sinh trước khi giao. Họ muốn thuê kho nhà bạn một mùa.','adult,money,home,neighbor',[
B('Cho thuê kho có biên nhận','Có thu, bận chỗ nhà','Người thuê muốn giữ hàng giá trị hơn, cần bạn nhận trách nhiệm kiểm đếm.','Tăng điều kiện và công kiểm','Giữ hợp đồng chỉ cho chỗ','deal', ['probe','deal']),
B('Giúp tìm kho chuyên nghiệp','Giữ nhà, có đầu mối nghề','Chủ hàng giới thiệu bạn với đội đang cần người điều phối giao nhận.','Thử một dự án có giờ rõ','Chỉ giữ mối giới thiệu','bond', ['bond','exit']),
B('Xin bán hộ theo từng đơn','Có việc phụ, thêm trách nhiệm','Khách mua hỏi luôn người lắp. Một người thợ muốn làm cùng bạn.','Gộp dịch vụ theo hợp đồng','Chỉ bán hàng không nhận lắp','build', ['deal','deal'])]),
E('m28','Hạn mức nhảy thêm hai số không','{person} chỉ màn hình thẻ mới. Hạn mức cấp sai khiến bạn tưởng đủ tiền mở cả cửa hàng.','adult,money,friend',[
B('Báo sửa và xin hạn mức phù hợp','Giữ an tâm, bỏ ảo tưởng vốn','Ngân hàng hỏi kế hoạch kinh doanh thật để xét khoản nhỏ hơn.','Làm kế hoạch theo sức trả','Tự gây vốn trước khi vay','truth', ['deal','bond']),
B('Khóa chi thẻ, giữ bằng chứng','Giữ tiền, phải theo hồ sơ','Hồ sơ khép, bạn thấy mình vẫn muốn mở quầy bằng vốn nhỏ.','Thử bán theo đơn trước','Giữ vốn tới khi rõ khách','probe', ['deal','bond']),
B('Dùng dịp ấy rà lại kế hoạch','Có góc nhìn, chưa mở ngay','Kế hoạch nhỏ tìm được người góp công thay tiền.','Thử chung một mùa','Giữ mỗi người một phần việc','build', ['bond','bond'])]),
E('m29','Tên bạn trên một nhãn hàng lạ','{person} cầm sản phẩm mang đúng tên bạn. Người bán tưởng tên ấy không có người dùng thật.','adult,money,friend',[
B('Đề nghị đổi tên và làm rõ','Giữ danh, có thể tranh cãi','Người bán muốn thuê bạn kể câu chuyện tên thật cho dòng mới.','Chỉ kể với quyền duyệt rõ','Giữ tên khỏi quảng cáo','defy', ['truth','bond']),
B('Thương lượng quyền dùng giới hạn','Có thu, gắn tiếng với hàng','Khách phản ánh chất lượng. Bên bán muốn bạn đứng ra trấn an.','Đòi sửa hàng trước khi nói','Chấm dứt quyền dùng theo hợp đồng','deal', ['build','deal']),
B('Tự làm một sản phẩm mang tên mình','Có đường riêng, cần vốn thử','Hai nhãn bị khách nhầm, người bán cũ đề nghị chia thị trường.','Đặt khác biệt bằng chất lượng','Đổi tên để giữ tự chủ','build', ['bond','bond'])]),
E('m30','Trại bò đổi phần góp của bạn','{person} báo trại muốn hoàn phần góp nhỏ của bạn bằng một con bò. Phí đưa về gần bằng giá bán, nhà lại chưa có chuồng.','adult,money,friend',[
B('Nhận giá trị tương đương qua thỏa thuận','Có tiền dùng, bớt chuyện kể','Trại muốn bạn giới thiệu cách hai bên đã giải quyết việc hoàn phần góp.','Kể theo thỏa thuận hai bên','Giữ việc hoàn phần riêng tư','deal', ['truth','exit']),
B('Góp bò vào trại có sổ','Có phần thu, phụ thuộc trại','Trại đề nghị đổi phần bò thành cổ phần dài hạn.','Kiểm doanh thu trước khi đổi','Giữ hợp đồng ngắn theo mùa','build', ['probe','deal']),
B('Tặng cho nhóm sinh kế có kiểm','Có người hưởng, cần theo dõi','Nhóm báo có bê đầu tiên, muốn bạn giúp tìm đầu ra cho sản phẩm.','Giới thiệu khách minh bạch','Chuyển cho nhóm tự quản','care', ['truth','bond'])]),
E('m31','Người giàu gọi đòi món nợ nhỏ','{person} đã giàu hơn xưa nhiều lần, nhưng gọi nhắc đúng khoản bạn mượn thời ở trọ.','adult,money,friend',[
B('Trả và mời một bữa cơm','Khép nợ, mở lại tình','Người bạn mang tới cơ hội làm việc nhưng yêu cầu bạn tự ứng tuyển.','Ứng tuyển bằng năng lực thật','Giữ tình bạn ngoài công việc','bond', ['bond','bond']),
B('Hỏi vì sao nhớ đúng hôm nay','Có câu chuyện, phải nghe lâu','Người ấy đang tìm lại nhóm trọ cũ để cứu căn nhà khỏi bị bán.','Góp công nối lại nhóm','Giúp giữ ký ức thay giữ nhà','probe', ['deal','deal']),
B('Xin đổi nợ bằng một việc mình giỏi','Có cuộc trao đổi, giữ tự trọng','Việc làm tốt, người ấy muốn thuê bạn thường xuyên với giá rõ.','Nhận một hợp đồng thử','Chỉ làm việc trả món nợ','deal', ['deal','build'])]),
E('m32','Heo đất có món của ông','{person} đập heo đất và tìm thấy một vật bằng vàng gói trong giấy cũ. Bạn nhớ ông từng nhờ cất hộ.','adult,money,child',[
B('Xác minh chủ và giá trị','Rõ phần, tốn thời gian','Cả nhà xác nhận món thuộc phần con, nhưng con muốn dùng khác ý bạn.','Đặt giới hạn rồi để con chọn','Giữ giúp tới tuổi đã hẹn','probe', ['exit','care']),
B('Giữ làm quỹ học có sổ','Có tương lai, bớt tiền dùng ngay','Con muốn dùng một phần học nghề không theo đường bằng cấp.','Cho thử khóa có mục tiêu','Giữ quỹ chờ con rõ hơn','care', ['bond','care']),
B('Dùng một phần làm việc chung với con','Có trải nghiệm, có rủi ro nhỏ','Việc có lời, con hỏi phần nào là vốn mình có quyền tự quyết.','Chia vốn lời bằng sổ','Khép việc và trả phần con','build', ['deal','exit'])]),
E('m33','Em hỏi vay cưới lần thứ ba','{person} nói lần này tổ chức nhỏ thôi. Tờ dự toán có ba khoản đều ghi tạm tính.','adult,money,funds,sibling',[
B('Cho vay phần có khả năng mất','Giúp em, giữ trần tiền','Sau cưới, người ấy xin đổi kỳ trả vì nhận được việc xa nhà.','Đổi lịch bằng thỏa thuận rõ','Giữ lịch nhỏ đều hơn','deal', ['deal','bond']),
B('Tặng một phần, không cho vay','Rõ quà, bỏ quyền đòi','Người ấy nhớ khoản quà và nhờ bạn giữ một quỹ nhỏ cho việc nhà.','Cùng lập quỹ minh bạch','Để người ấy tự giữ phần mình','care', ['truth','bond']),
B('Giúp cắt dự toán và tự làm','Có lễ vừa sức, tốn công','Đám cưới nhỏ được khen, một cặp khác thuê hai người tổ chức.','Thử một buổi có phân công','Giữ việc giúp trong gia đình','build', ['deal','care'])]),
E('m34','Bố muốn chia nhà khi còn sống','{person} nói không muốn con cái cãi nhau sau này. Mỗi người đã đo một góc sân khác nhau.','adult,money,home,father',[
B('Mời cả nhà định phần công khai','Rõ quyền, khó nói nhu cầu','Một người muốn nhận ít đất để có quyền ở cùng bố lâu hơn.','Ghi cả quyền chăm và ở','Tách tài sản khỏi công chăm','truth', ['care','care']),
B('Đề nghị giữ nhà dùng chung','Giữ chốn về, cần người quản','Nhà cần sửa lớn, người ít về nhất muốn đổi thành nhà cho thuê.','Lập quỹ giữ chốn về','Cho thuê một phần có giới hạn','care', ['care','exit']),
B('Nhận phần để dựng việc riêng','Có vốn, xa sân cũ','Việc riêng có khách, bố muốn dành một góc làm nơi tụ họp.','Dành lịch gia đình ở quán','Giúp sửa một nơi họp khác','build', ['bond','care'])]),
E('m35','Khoản gửi về bên kia gia đình','{person} đã dùng quỹ chung hỗ trợ người thân mà chưa nói. Khoản giúp nay thành lịch hằng tháng.','adult,money,spouse',[
B('Mở sổ và cùng chốt trần hỗ trợ','Giữ tình, rõ khả năng','Một người thân cần khoản đột xuất vượt trần hai bạn đã chọn.','Xét riêng bằng phần tự nguyện','Giữ trần và giúp bằng công','truth', ['bond','care']),
B('Tách quỹ giúp hai bên','Có ranh, phải chia theo sức','Hai bên có nhu cầu khác nhau, một khoản quỹ đang dư còn bên kia thiếu.','Cho vay giữa quỹ có hẹn','Đổi tỷ lệ góp theo kỳ','deal', ['care','deal']),
B('Giúp người nhận có nguồn thu','Có lối lâu, cần theo sát','Việc mới của người thân có khách, họ muốn dừng nhận tiền nhưng xin mượn dụng cụ.','Cho mượn có sổ trả','Tặng một phần rồi khép trợ cấp','build', ['bond','exit'])]),
E('m36','Tiền du học chỉ đủ nửa','{person} nhận thư nhập học. Khoản học bổng chỉ đủ học phí, chưa có tiền sống.','late,money,child',[
B('Cùng tìm phần hỗ trợ còn thiếu','Giữ cơ hội, chậm quyết định','Con tìm được chương trình đổi việc lấy chỗ ở, cần kiểm điều kiện.','Xác minh rồi cùng chuẩn bị','Chọn chương trình gần hơn','probe', ['probe','bond']),
B('Hoãn một kỳ để cùng gây quỹ','Có vốn thật, chậm một bước','Việc làm trong kỳ hoãn mở một lối nghề con chưa từng nghĩ tới.','Cho con thử nghề trước','Giữ kế hoạch đi đã chốt','build', ['bond','bond']),
B('Chọn học gần rồi trao đổi ngắn','Giữ nền, đổi giấc mơ','Chương trình gần cho con cơ hội đi một mùa với thầy hướng dẫn.','Góp phần đi ngắn có mục tiêu','Để con tự gây quỹ phần thêm','care', ['deal','care'])]),
E('m37','Ân nhân đòi phần trăm suốt đời','{person} nhắc lần từng giúp bạn và đưa tờ thỏa thuận muốn hưởng phần mọi thu nhập sau này.','adult,money,mentor',[
B('Đề nghị trả ơn bằng khoản hữu hạn','Rõ tình tiền, khó nói','Người ấy đồng ý khoản cụ thể nhưng muốn bạn giúp học trò mới.','Giúp học trò không gắn nợ','Trả xong và giữ lời chào','deal', ['probe','care']),
B('Nhờ người trung lập rà thỏa thuận','Có căn cứ, dễ lạnh lòng','Thỏa thuận được sửa, người ấy muốn cùng kể câu chuyện hợp tác.','Kể đúng cả hai phần','Giữ hồ sơ và chuyện riêng','probe', ['truth','truth']),
B('Trả bằng công việc cụ thể mình chọn','Có hành động, giữ quyền đời','Việc trả ơn giúp bạn gặp một nhóm muốn hợp tác độc lập.','Thử dự án với nhóm mới','Khép việc để tập trung nghề cũ','build', ['bond','exit'])]),
E('m38','Hàng xóm nhờ đứng tên','{person} nhờ bạn bảo lãnh khoản vay vì giấy tờ của họ chưa đủ. Họ hứa chỉ là thủ tục.','adult,money,neighbor',[
B('Chỉ xem xét sau khi hiểu nghĩa vụ','Có căn cứ, khó giữ vui','Hồ sơ lộ mức trả cao hơn họ nói. Người ấy muốn giảm quy mô việc làm.','Giúp dựng kế hoạch nhỏ','Giới thiệu nơi tư vấn độc lập','probe', ['care','bond']),
B('Không bảo lãnh, giúp một khoản giới hạn','Giữ trần, vẫn giúp người','Khoản nhỏ giúp họ bắt đầu, họ muốn bạn góp công vào đơn đầu.','Thử góp công có chia rõ','Giữ khoản giúp độc lập','care', ['deal','care']),
B('Rủ tìm cách thuê thay mua','Giảm vốn, phải chia quyền','Cách thuê chạy được, chủ dụng cụ muốn mời cả hai làm đại lý.','Thử một khu nhỏ','Giữ thuê phục vụ việc mình','build', ['bond','build'])]),
E('m39','Gia đình biết quỹ riêng của bạn','{person} tình cờ thấy số dư bạn chưa từng kể. Họ tưởng bạn đã giấu vì không muốn giúp nhà.','adult,money,spouse',[
B('Nói rõ mục tiêu khoản riêng','Có sự thật, dễ bị trách','Người ấy cũng kể khoản mình giữ. Hai người có hai giấc mơ chưa chia sẻ.','Lập lịch cho cả hai mục tiêu','Giữ quỹ riêng với phần góp chung','truth', ['build','deal']),
B('Thống nhất phần tự quyết mỗi người','Có ranh, giảm kỳ vọng','Một cơ hội cần vốn chung tới, hai người cân nhắc có dùng phần riêng không.','Góp tự nguyện bằng văn bản','Giữ hai quỹ và bỏ cơ hội','deal', ['deal','care']),
B('Dùng dịp này lập quỹ dự phòng nhà','Có nền chung, bớt phần tự do','Quỹ đủ mục tiêu, người thân muốn nhờ góp một việc khác.','Giữ quỹ và giúp phần khác','Xét khoản giúp bằng đồng thuận','care', ['care','care'])]),
E('m40','Bạn nghèo đi, bạn khá lên','{person} xin ứng trước tiền để làm việc cho bạn. Người ấy vẫn gọi bạn bằng biệt danh thời nhỏ.','adult,money,friend',[
B('Thuê với vai và lương rõ','Có người tin, dễ lẫn tình','Bạn ấy làm tốt và muốn quyền góp ý ngang người quản lâu năm.','Đánh giá bằng tiêu chí chung','Tách vai bạn khỏi vai quản lý','build', ['bond','build']),
B('Giúp tìm khách riêng','Giữ tình, ít quyền can thiệp','Khách của hai người trùng nhau, bạn ấy xin chia vùng nhận việc.','Thỏa thuận giới thiệu hai chiều','Để khách tự chọn minh bạch','bond', ['deal','truth']),
B('Tặng khoản một lần có giới hạn','Giúp ngay, không có việc lâu','Người ấy dựng được việc và muốn trả bằng một phần sản phẩm.','Nhận như khách mua thật','Giữ quà không thành món nợ','care', ['deal','bond'])]),
E('m41','Sếp rủ làm ngoài bằng đồ chung','{person} bảo thiết bị rảnh thì dùng một đêm không sao. Tiền công không đi qua sổ.','adult,money,job,boss',[
B('Đề nghị hợp đồng ngoài giờ hợp lệ','Có thu, mất phần kín','Việc được duyệt, đồng nghiệp muốn chia cơ hội dùng máy ngoài giờ.','Lập lịch và phí công khai','Giữ một dự án có giới hạn','deal', ['deal','exit']),
B('Từ chối rồi tự thuê thiết bị','Giữ quyền, tốn phí đầu','Khách thích sản phẩm độc lập, sếp cũ muốn mua qua bạn.','Nhận đơn bằng giá rõ','Giữ nhóm khách ngoài công ty','build', ['build','bond']),
B('Hỏi quy định bằng văn bản','Có căn cứ, dễ bị để ý','Công ty lập quy trình mới, mời bạn làm đầu mối nhận việc phụ hợp lệ.','Nhận với phân công có công','Giữ vai người sử dụng quy trình','probe', ['deal','build'])]),
E('m42','Khoản phí không có biên lai','{person} gợi ý muốn hồ sơ nhanh thì có một khoản không ghi trên bảng phí.','adult,money,official',[
B('Xin danh mục phí chính thức','Rõ quyền, có thể chậm','Hồ sơ tiến lên, vài người cùng cảnh muốn bạn giúp tìm thông tin.','Gom nguồn chính thức cho nhóm','Chỉ chia phần mình đã dùng','truth', ['bond','deal']),
B('Nhờ người đủ chuyên môn theo hồ sơ','Có đường rõ, trả phí thật','Người hỗ trợ muốn dùng hồ sơ đã ẩn thông tin làm mẫu cho người khác.','Cho dùng phần đã kiểm riêng tư','Giữ hồ sơ chỉ trong việc mình','probe', ['probe','truth']),
B('Chọn phương án không cần hồ sơ ấy','Làm được sớm, đổi kế hoạch','Phương án nhỏ chạy tốt, khách hỏi bạn có mở rộng theo cách cũ không.','Giữ mô hình ít ràng buộc','Xử lý hồ sơ mở rộng đúng lệ','exit', ['bond','truth'])]),
E('m43','Chuyến hàng cuối của anh rể','{person} mời góp tiền vào chuyến hàng qua biên giới, không cho xem giấy tờ. Họ nói chỉ cần một lần.','adult,money,sibling',[
B('Chỉ tham gia khi đủ hồ sơ thật','Có điều kiện, dễ bị gạt khỏi nhóm','Một bên rút, một bên muốn làm lô nhỏ qua đơn vị hợp lệ.','Thử lô có kiểm chứng','Giữ tiền ngoài cuộc','probe', ['probe','bond']),
B('Từ chối, rủ mở đường bán gần','Giữ người, bỏ khoản lời hứa','Việc gần có khách, người ấy muốn dùng lời lãi bù khoản cũ.','Tách sổ và vốn việc mới','Giúp họ tìm người tư vấn khoản cũ','build', ['bond','probe']),
B('Giữ chứng từ, tìm hỗ trợ phù hợp','Giữ phần mình, quan hệ căng','Người ấy quay lại xin một cuộc nói chuyện không có chuyện góp tiền.','Gặp với ranh giới rõ','Nhờ người thân làm trung gian','truth', ['bond','build'])]),
E('m44','Chức lãnh đạo phải mua gói hàng','{person} khoe bạn được lên cấp bán hàng nếu mua trước một lô lớn. Khách chưa có tên trong sổ.','adult,money,friend',[
B('Kiểm doanh thu từ khách thật','Có căn cứ, mất hào hứng','Người bạn bắt đầu hỏi lại cách tính và muốn tìm việc bán hàng khác.','Cùng thử quầy theo đơn','Giới thiệu công việc có hợp đồng','probe', ['bond','deal']),
B('Không mua gói, tự thử bán nhỏ','Giữ vốn, ít lời hứa lớn','Bạn có khách thật, nhóm cũ muốn tính khách ấy vào thành tích của họ.','Giữ sổ khách độc lập','Ngừng dùng sản phẩm của nhóm','build', ['bond','exit']),
B('Giúp bạn tính lãi sau mọi phí','Có thể giúp tỉnh, dễ bị giận','Bạn ấy muốn rời nhóm nhưng còn hàng tồn cần giải quyết minh bạch.','Giúp tìm cách hoàn theo điều kiện','Giúp việc mới không ôm hàng cũ','care', ['probe','care'])]),
E('m45','Đất quy hoạch qua lời người quen','{person} nói chỉ người thân mới được giá này. Bản đồ gửi tới không có nguồn hay ngày cập nhật.','adult,money,friend',[
B('Tra cứu và kiểm giấy gốc','Có thông tin, lỡ giá hứa','Giấy thật khác lời rao. Người quen xin bạn giúp sửa thông tin bán.','Sửa thông tin công khai','Rút khỏi việc môi giới','probe', ['truth','exit']),
B('Giữ vốn, mua thứ tạo thu hiện tại','Có dòng tiền, bỏ giấc tăng nhanh','Việc nhỏ có khách, người quen đề nghị góp tài sản thay tiền.','Định giá và quyền dùng rõ','Giữ hợp tác bằng tiền mặt nhỏ','build', ['deal','bond']),
B('Đề nghị chỉ bàn sau khi thẩm định','Giữ quan hệ, chưa xuống tiền','Người bán chịu thẩm định nhưng muốn chia phí kiểm trước.','Chia phí với giới hạn rõ','Để bên bán tự chuẩn bị hồ sơ','deal', ['exit','deal'])]),
E('m46','Giá vàng đổi đúng lúc cần tiền','{person} hỏi bạn định xoay khoản chi đột xuất thế nào. Món dự phòng vừa lên giá rồi lại giảm.','adult,money,friend',[
B('Bán phần đủ cho việc trước mắt','Có tiền dùng, còn phần chờ','Khoản chi xong, người thân muốn bạn quản dự phòng chung.','Lập phần chung với quyền rõ','Giữ mỗi người tự quản','deal', ['build','bond']),
B('Đàm phán lịch chi thay vì bán hết','Giữ dự phòng, mang kỳ hạn','Lịch trả đầu đúng, bên nhận đề nghị giảm phí nếu tất toán sớm.','So phần tiết kiệm với khả năng','Giữ lịch trả đã đủ sức','probe', ['bond','bond']),
B('Đổi bớt nhu cầu để giảm khoản chi','Giữ nền, bỏ phần tiện nghi','Giải pháp nhỏ dùng tốt, gia đình muốn áp dụng cho việc khác.','Giữ phần giản dị có ích','Dành phần dư cho điều quan trọng','exit', ['bond','bond'])]),
E('m47','Hoa hồng để thuyết phục cả xóm','{person} muốn mua cả dãy và trả công bạn nếu các hộ cùng bán. Bạn vẫn sống trong dãy ấy.','adult,money,home,neighbor',[
B('Công khai khoản công trước khi nói','Có thu minh bạch, dễ bị nghi','Một hộ muốn bạn đại diện riêng với điều kiện khác các hộ còn lại.','Giữ vai đã công khai','Rút hoa hồng để làm người giúp','truth', ['truth','exit']),
B('Từ chối hoa hồng, giúp đọc hồ sơ','Giữ vai, tốn công không phí','Xóm muốn bạn thương lượng chỗ ở mới, người mua muốn nói riêng.','Chỉ gặp với nhóm được cử','Chuyển việc cho người chuyên môn','care', ['bond','bond']),
B('Đề nghị nhóm tự thương lượng chung','Có sức chung, chậm thống nhất','Nhóm chia hai ý về giá và quyền ở lại. Người muốn bán trước bắt đầu hỏi có thể tự ký riêng không.','Tách nhu cầu thành hai phương án','Để từng hộ tự quyết phần mình','deal', ['bond','defy'])]),
E('m48','Quà cuối đời cho người ngoài họ','{person} hỏi vì sao bạn muốn để một phần cho người từng giúp mình. Con cái chưa nghe câu chuyện ấy.','old,money,child',[
B('Kể câu chuyện và ghi phần rõ','Có người hiểu, vẫn có so bì','Người được tặng xin dùng phần ấy cho một việc mang lợi cho cả nhà bạn.','Lập việc chung có người kiểm','Giữ quà đúng quyền họ tự quyết','truth', ['probe','defy']),
B('Tặng khi còn sống với giới hạn','Thấy người nhận, giảm di sản','Sau khi nhận, người ấy muốn bạn chứng kiến thành quả đầu tiên.','Tới thăm và để họ quyết','Giữ liên hệ qua thư','care', ['bond','bond']),
B('Giữ một phần quỹ mở cho việc giúp người','Có di sản chung, cần người trông','Các con muốn cùng quản nhưng bất đồng người được nhận đầu tiên.','Đặt tiêu chí trước người nhận','Thu nhỏ quỹ để thử','deal', ['bond','care'])]),
E('m49','Khoản tiền con giấu khỏi bạn','{person} thú nhận đã giữ một khoản lẽ ra chuyển cho bạn. Tiền được dùng để cứu việc làm riêng.','late,money,child',[
B('Mở sổ, chốt cách hoàn phần giữ','Rõ trách nhiệm, quan hệ khó','Con trả kỳ đầu rồi mời bạn xem công việc đã được giữ lại.','Xem nhưng giữ lịch trả','Tách việc thăm khỏi tiền nợ','truth', ['bond','bond']),
B('Chuyển thành khoản góp có quyền rõ','Có phần việc, chia rủi ro','Việc phục hồi, con muốn mua lại phần góp để tự quyết.','Định giá theo sổ đã ghi','Giữ phần nhỏ không điều hành','deal', ['deal','bond']),
B('Không góp thêm, giúp sửa cách quản','Giữ giới hạn, bỏ công dạy','Con thuê được người giữ sổ và muốn bạn thôi kiểm từng khoản.','Bàn giao trách nhiệm theo mốc','Giữ một lần đối chiếu mỗi kỳ','care', ['care','probe'])]),
E('m50','Sổ nợ để lại sau lưng','{person} giúp bạn liệt kê nghĩa vụ và tài sản. Một khoản cũ chỉ còn lời kể, chưa có chứng từ.','old,money,debt,child',[
B('Xác minh rồi thu xếp phần của mình','Có căn cứ, phải đối mặt','Khoản rõ được xử lý, gia đình muốn giữ cuốn sổ để tránh lặp lại.','Viết kinh nghiệm cùng chứng từ','Khép phần nợ khỏi chuyện đời con','truth', ['probe','exit']),
B('Bán bớt thứ không còn cần','Nhẹ nghĩa vụ, mất vật quen','Người mua muốn giữ tên bạn trên món đồ trong cửa hàng của họ.','Cho giữ với câu chuyện thật','Nhận tiền và khép kỷ vật','deal', ['bond','exit']),
B('Nhờ người có nghề lập kế hoạch cuối','Có phương án, trả phí rõ','Gia đình được giải thích phần trách nhiệm thật và muốn cùng bàn tài sản còn lại.','Mở cuộc họp có hướng dẫn','Ghi ý nguyện riêng bằng văn bản','probe', ['probe','bond'])]),
];
