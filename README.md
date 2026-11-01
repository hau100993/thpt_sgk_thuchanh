# Vật lí 12 tương tác

Sách Vật lí 12 dạng web: 10 bài học theo chương trình GDPT 2018, mỗi bài có một mô phỏng 3D, công thức cập nhật theo số liệu, vòng **Dự đoán → Thử → Chứng minh → Bài tập**, con dấu tiến độ và ghi chú cho giáo viên.

Site tĩnh thuần HTML/CSS/JS, không cần build, không cần thư viện ngoài (font Google là tuỳ chọn; mất mạng vẫn chạy với font hệ thống). Mở `index.html` bằng trình duyệt là dùng được.

## Danh sách bài

| Chủ đề | Bài | Mô phỏng |
|---|---|---|
| Vật lí nhiệt | 01 Cấu trúc của chất và sự chuyển thể | Động lực học phân tử Lennard-Jones, 125 phân tử |
| | 02 Nội năng và định luật I NĐLH | Xi-lanh khí, đun/nén, sổ ΔU = A + Q |
| | 03 Nhiệt dung riêng, nhiệt nóng chảy riêng, nhiệt hoá hơi riêng | Đun nước đá −20 °C đến hoá hơi hết |
| Khí lí tưởng | 04 Mô hình động học phân tử chất khí | Phân bố Maxwell, chuyển động Brown |
| | 05 Các định luật chất khí và phương trình trạng thái | Đẳng nhiệt, đẳng áp, đẳng tích |
| Từ trường | 06 Từ trường và lực từ | Dây dẫn trong nam châm chữ U, F = BIL sin α |
| | 07 Từ thông và cảm ứng điện từ | Nam châm qua cuộn dây, Faraday và Lenz |
| | 08 Máy phát điện xoay chiều | Khung dây quay, e = E₀ sin ωt |
| Vật lí hạt nhân | 09 Cấu trúc hạt nhân và năng lượng liên kết | Dựng hạt nhân, đồ thị Wlk/A |
| | 10 Phóng xạ và chu kì bán rã | Khối hạt nhân phân rã ngẫu nhiên |

## Xem trực tuyến (GitHub Pages)

Bật một lần: vào **Settings → Pages → Build and deployment**, chọn *Source: Deploy from a branch*, nhánh `main`, thư mục `/docs`, bấm **Save**. Khoảng một phút sau, trang có ở:

https://hau100993.github.io/thpt_sgk_thuchanh/

Muốn dùng Cloudflare Pages: kết nối repo này, để trống Build command, đặt Build output directory là `docs`.

Xem trên máy: mở `docs/index.html` bằng trình duyệt.

## Sửa và thêm bài (dành cho người phát triển)

Sửa trong `src/` và `assets/`, đừng sửa thẳng trong `docs/` (sẽ bị ghi đè khi build):

```
src/index.html          trang mục lục
src/bai/NN-ten-bai.html nội dung từng bài (dòng đầu: <!-- title: ... -->)
assets/book.css         toàn bộ giao diện, màu sáng/tối
assets/core.js          bộ vẽ 3D nét mực (Ink3D), đồ thị, con dấu, mô phỏng khí
build.py                ghép src/ thành docs/
test.py                 mở từng trang bằng Chrome headless, báo lỗi JS và tràn ngang
```

Thêm một bài mới:
1. Chép một file trong `src/bai/` làm khung, đổi nội dung và mã mô phỏng.
2. Thêm một dòng vào `VL.LESSONS` trong `assets/core.js` (mục lục và nút bài trước/sau tự cập nhật).
3. Chạy `python3 build.py`, mở `docs/index.html` để xem, rồi commit cả `src/` lẫn `docs/`.

## Bản quyền nội dung
Toàn bộ lời giảng, bài tập và hình vẽ được tự biên soạn theo yêu cầu cần đạt của chương trình, không sao chép từ sách giáo khoa của bộ nào. Số liệu vật lí (nhiệt dung riêng, năng lượng liên kết, chu kì bán rã…) là hằng số khoa học công khai.
