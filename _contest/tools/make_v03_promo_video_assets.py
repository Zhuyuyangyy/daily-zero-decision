from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


BASE = Path(r"D:\ZYY Project\_contest\final-submit")
OUT_DIR = BASE / "_v03_promo_frames"
SCRIPT_PATH = BASE / "official-document-assistant-v0.3-promo-script.md"
SRT_PATH = BASE / "official-document-assistant-v0.3-promo-captions.srt"

FONT_CANDIDATES = [
    r"C:\Windows\Fonts\msyh.ttc",
    r"C:\Windows\Fonts\simhei.ttf",
    r"C:\Windows\Fonts\simsun.ttc",
]


def font_path() -> str:
    for candidate in FONT_CANDIDATES:
        if Path(candidate).exists():
            return candidate
    raise RuntimeError("No Chinese font found")


FONT_PATH = font_path()


def font(size: int, index: int = 0) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_PATH, size, index=index)


def bbox(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for char in text:
        test = current + char
        if bbox(draw, test, fnt)[0] <= max_width:
            current = test
            continue
        if current:
            lines.append(current)
        current = char
    if current:
        lines.append(current)
    return lines


def panel(draw: ImageDraw.ImageDraw, xy: tuple[int, int, int, int], fill: tuple[int, int, int], outline: tuple[int, int, int] | None = None) -> None:
    draw.rounded_rectangle(xy, radius=34, fill=fill, outline=outline, width=2 if outline else 1)


def text_block(
    draw: ImageDraw.ImageDraw,
    text: str,
    x: int,
    y: int,
    max_width: int,
    fnt: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
    line_gap: int = 12,
) -> int:
    yy = y
    for line in wrap(draw, text, fnt, max_width):
        draw.text((x, yy), line, font=fnt, fill=fill)
        yy += bbox(draw, line, fnt)[1] + line_gap
    return yy


def pill(draw: ImageDraw.ImageDraw, text: str, x: int, y: int, fill: tuple[int, int, int], color: tuple[int, int, int] = (255, 255, 255)) -> int:
    fnt = font(34)
    w, h = bbox(draw, text, fnt)
    draw.rounded_rectangle([x, y, x + w + 48, y + h + 28], radius=26, fill=fill)
    draw.text((x + 24, y + 13), text, font=fnt, fill=color)
    return x + w + 64


def draw_header(draw: ImageDraw.ImageDraw, page: int, title: str) -> None:
    draw.rectangle([0, 0, 1080, 22], fill=(37, 194, 138))
    draw.text((70, 66), "official-document-assistant v0.3", font=font(31), fill=(124, 247, 198))
    draw.text((888, 66), f"{page:02d}/09", font=font(31), fill=(196, 205, 220))
    text_block(draw, title, 70, 128, 940, font(58), (255, 255, 255), 12)


def draw_caption(draw: ImageDraw.ImageDraw, caption: str) -> None:
    panel(draw, (70, 1528, 1010, 1770), (245, 244, 238))
    draw.text((112, 1572), "配音稿", font=font(34), fill=(15, 23, 42))
    text_block(draw, caption, 112, 1628, 850, font(37), (15, 23, 42), 10)


def draw_mock_doc(draw: ImageDraw.ImageDraw, x: int, y: int, title: str, rows: list[str]) -> None:
    panel(draw, (x, y, x + 430, y + 560), (255, 255, 255), (220, 224, 232))
    draw.text((x + 42, y + 42), title, font=font(38), fill=(15, 23, 42))
    yy = y + 116
    for row in rows:
        draw.rounded_rectangle([x + 42, yy, x + 388, yy + 34], radius=16, fill=(229, 234, 242))
        draw.text((x + 54, yy + 44), row, font=font(28), fill=(71, 85, 105))
        yy += 86


def draw_checklist(draw: ImageDraw.ImageDraw, x: int, y: int, rows: list[tuple[str, str]]) -> None:
    panel(draw, (x, y, x + 900, y + 720), (255, 255, 255), (220, 224, 232))
    yy = y + 54
    for label, desc in rows:
        draw.ellipse([x + 48, yy + 8, x + 82, yy + 42], fill=(37, 194, 138))
        draw.text((x + 55, yy + 2), "✓", font=font(30), fill=(255, 255, 255))
        draw.text((x + 108, yy), label, font=font(38), fill=(15, 23, 42))
        draw.text((x + 108, yy + 50), desc, font=font(28), fill=(100, 116, 139))
        yy += 116


def frame(page: int, title: str, caption: str, drawer) -> Image.Image:
    image = Image.new("RGB", (1080, 1920), (17, 24, 39))
    draw = ImageDraw.Draw(image)
    draw_header(draw, page, title)
    drawer(draw)
    draw_caption(draw, caption)
    draw.text((70, 1818), "SkillHub 搜索：official-document-assistant", font=font(31), fill=(196, 205, 220))
    return image


SLIDES = [
    {
        "title": "公文写完，最怕没人做第一轮把关",
        "caption": "很多材料不是不会写，而是写完之后没人能快速、稳定、按规范帮你初审。",
        "draw": lambda d: (
            draw_mock_doc(d, 78, 430, "一份通知初稿", ["标题像口语", "主送漏了", "附件不对应", "日期不规范"]),
            panel(d, (558, 430, 1002, 990), (30, 41, 59), (71, 85, 105)),
            text_block(d, "真实痛点：反复改、靠经验、低级错误多。", 602, 492, 340, font(48), (255, 255, 255), 14),
            pill(d, "人工复核前", 602, 760, (79, 70, 229)),
            pill(d, "先机器初审", 602, 840, (37, 194, 138)),
        ),
    },
    {
        "title": "它解决的不是代写，而是公文初审流程",
        "caption": "这个 Skill 的定位是人工复核前的公文初审助手，先检查、再修订、再提醒风险。",
        "draw": lambda d: (
            panel(d, (90, 450, 990, 1050), (255, 255, 255), (220, 224, 232)),
            pill(d, "机器初审", 150, 530, (37, 194, 138), (15, 23, 42)),
            pill(d, "建议修订稿", 150, 640, (79, 70, 229)),
            pill(d, "风险提示", 150, 750, (245, 158, 11)),
            pill(d, "督办提取", 150, 860, (14, 165, 233)),
            text_block(d, "把“凭经验反复改公文”变成一套可复用的初审工作流。", 560, 555, 350, font(46), (15, 23, 42), 14),
        ),
    },
    {
        "title": "格式漏项，新手最容易踩坑",
        "caption": "它会检查标题、主送机关、落款、日期、附件说明和正文层级这些容易漏掉的细节。",
        "draw": lambda d: draw_checklist(
            d,
            90,
            430,
            [
                ("标题三要素", "支持“发文机关 + 关于 + 事由 + 文种”"),
                ("主送与落款", "检查主送机关、发文单位、成文日期"),
                ("附件一致性", "正文引用和附件清单是否对应"),
                ("正文层级", "提示“一、”“（一）”“1.”混用"),
                ("正式语气", "识别口语化和缺少依据的强制表述"),
            ],
        ),
    },
    {
        "title": "文种误用，比格式错误更隐蔽",
        "caption": "请示、报告、函、通知常常混用。v0.3 加了专项规则，能提示这些典型问题。",
        "draw": lambda d: (
            panel(d, (80, 430, 1000, 1138), (255, 255, 255), (220, 224, 232)),
            text_block(d, "请示：一文一事，结尾要有“妥否，请批示”。", 132, 496, 820, font(39), (15, 23, 42), 18),
            text_block(d, "报告：不能夹带请批示、拟申请、申请追加等事项。", 132, 648, 820, font(39), (15, 23, 42), 18),
            text_block(d, "函：避免命令式语气，保持商洽、平实。", 132, 800, 820, font(39), (15, 23, 42), 18),
            text_block(d, "通知：对象、事项、时间、要求要清楚。", 132, 952, 820, font(39), (15, 23, 42), 18),
        ),
    },
    {
        "title": "最有用的是：直接给一版修订稿",
        "caption": "只告诉你哪里错还不够。它会给出一版可复制、可人工复核的建议修订稿。",
        "draw": lambda d: (
            panel(d, (70, 430, 490, 1120), (254, 242, 242), (252, 165, 165)),
            panel(d, (590, 430, 1010, 1120), (240, 253, 244), (134, 239, 172)),
            d.text((112, 486), "原文问题", font=font(40), fill=(127, 29, 29)),
            text_block(d, "报告里写：\n妥否，请批示。\n\n下一步拟申请追加经费。", 112, 568, 330, font(34), (127, 29, 29), 16),
            d.text((632, 486), "建议修订", font=font(40), fill=(22, 101, 52)),
            text_block(d, "报告改为：\n特此报告。\n\n审批事项另行请示。", 632, 568, 330, font(34), (22, 101, 52), 16),
            d.line([510, 760, 570, 760], fill=(148, 163, 184), width=7),
            d.polygon([(570, 760), (545, 742), (545, 778)], fill=(148, 163, 184)),
        ),
    },
    {
        "title": "会议之后，自动抽出督办清单",
        "caption": "会议纪要里谁负责、什么时候完成、做什么，它会整理成一张清单。",
        "draw": lambda d: (
            panel(d, (70, 450, 1010, 1080), (255, 255, 255), (220, 224, 232)),
            d.text((112, 510), "会后督办事项", font=font(46), fill=(15, 23, 42)),
            d.rectangle([112, 600, 968, 660], fill=(226, 232, 240)),
            d.text((140, 613), "责任方", font=font(30), fill=(15, 23, 42)),
            d.text((392, 613), "期限", font=font(30), fill=(15, 23, 42)),
            d.text((622, 613), "事项", font=font(30), fill=(15, 23, 42)),
        ),
    },
    {
        "title": "敏感信息，先提示再脱敏",
        "caption": "政务材料不能只看写得好不好，还要注意手机号、身份证号、内部资料和涉密表述。",
        "draw": lambda d: (
            panel(d, (80, 450, 1000, 1090), (255, 255, 255), (220, 224, 232)),
            text_block(d, "识别风险：手机号、身份证号、内部资料、不得外传、涉密。", 132, 520, 820, font(42), (15, 23, 42), 16),
            panel(d, (132, 760, 948, 1002), (15, 23, 42)),
            d.text((170, 812), "13812345678  →  138****5678", font=font(35), fill=(124, 247, 198)),
            d.text((170, 884), "110105199001011234", font=font(35), fill=(248, 113, 113)),
            d.text((170, 944), "110105********1234", font=font(35), fill=(124, 247, 198)),
        ),
    },
    {
        "title": "支持 Word 和批量材料预审",
        "caption": "它支持 .docx 输入和 batch 批量审查，适合先扫一批材料，再交给人工复核。",
        "draw": lambda d: (
            panel(d, (100, 470, 980, 1080), (255, 255, 255), (220, 224, 232)),
            pill(d, ".docx 输入", 160, 560, (37, 194, 138), (15, 23, 42)),
            pill(d, "文件夹批量审查", 160, 670, (79, 70, 229)),
            pill(d, "Markdown / JSON 输出", 160, 780, (14, 165, 233)),
            text_block(d, "定位很清楚：不替代最终审核，但能减少第一轮低级错误和返工。", 160, 910, 760, font(43), (15, 23, 42), 14),
        ),
    },
    {
        "title": "如果你觉得有用，帮我收藏和下载",
        "caption": "作品已经发布到讯飞 SkillHub，搜索 official-document-assistant。热度榜看收藏量和下载量。",
        "draw": lambda d: (
            panel(d, (80, 450, 1000, 1120), (255, 255, 255), (220, 224, 232)),
            text_block(d, "SkillHub 搜索", 132, 545, 820, font(42), (100, 116, 139), 12),
            text_block(d, "official-document-assistant", 132, 620, 820, font(55), (15, 23, 42), 12),
            pill(d, "收藏", 132, 780, (37, 194, 138), (15, 23, 42)),
            pill(d, "下载", 310, 780, (79, 70, 229)),
            text_block(d, "这两个动作会计入热度榜。适合办公室、行政、学生组织、社团写通知和会议纪要前先用一下。", 132, 900, 820, font(38), (15, 23, 42), 12),
        ),
    },
]


def draw_table_rows_on_slide6(path: Path) -> None:
    image = Image.open(path).convert("RGB")
    draw = ImageDraw.Draw(image)
    rows = [("办公室", "6月18日前", "完成通知发布"), ("财务处", "6月25日前", "提交预算表"), ("信息中心", "待明确", "系统维护")]
    yy = 694
    for owner, due, task in rows:
        draw.line([112, yy - 20, 968, yy - 20], fill=(226, 232, 240), width=2)
        draw.text((140, yy), owner, font=font(31), fill=(15, 23, 42))
        draw.text((392, yy), due, font=font(31), fill=(15, 23, 42))
        draw.text((622, yy), task, font=font(31), fill=(15, 23, 42))
        yy += 96
    image.save(path)


def write_script() -> None:
    lines = [
        "# official-document-assistant v0.3 宣传视频配音稿",
        "",
        "## 45 秒竖版口播稿",
        "",
    ]
    for index, slide in enumerate(SLIDES, 1):
        lines.append(f"{index}. {slide['caption']}")
    lines.extend(
        [
            "",
            "## 发布文案",
            "",
            "基层政务、办公室、行政、学生组织写正式材料时，最耗时间的往往不是从零起草，而是写完后的第一轮规范审查、反复修改和会后督办整理。",
            "",
            "我做了一个讯飞 SkillHub 参赛 Skill：official-document-assistant。它面向人工复核前的初审环节，支持公文格式审查、文种规则提示、建议修订稿生成、会议督办事项提取和敏感信息脱敏预览。",
            "",
            "如果你觉得有用，可以在讯飞 SkillHub 搜索 official-document-assistant，帮我点一下收藏和下载。热度榜主要看收藏量和下载量。",
            "",
            "链接：https://skill.xfyun.cn/space/global/official-document-assistant",
        ]
    )
    SCRIPT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def fmt_time(seconds: int) -> str:
    return f"00:00:{seconds:02d},000" if seconds < 60 else f"00:01:{seconds - 60:02d},000"


def write_srt() -> None:
    chunks = []
    for index, slide in enumerate(SLIDES, 1):
        start = (index - 1) * 5
        end = index * 5
        chunks.append(f"{index}\n{fmt_time(start)} --> {fmt_time(end)}\n{slide['caption']}\n")
    SRT_PATH.write_text("\n".join(chunks), encoding="utf-8")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob("*.png"):
        old.unlink()
    for index, slide in enumerate(SLIDES, 1):
        image = frame(index, slide["title"], slide["caption"], slide["draw"])
        path = OUT_DIR / f"promo-{index:02d}.png"
        image.save(path)
        if index == 6:
            draw_table_rows_on_slide6(path)
    write_script()
    write_srt()
    print(f"frames={len(list(OUT_DIR.glob('*.png')))}")
    print(f"script={SCRIPT_PATH}")
    print(f"srt={SRT_PATH}")


if __name__ == "__main__":
    main()
