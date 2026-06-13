from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


BASE = Path(r"D:\ZYY Project\_contest\final-submit")
SLIDE_DIR = BASE / "_video_slide_pngs"
OUT_DIR = BASE / "_vertical_video_frames"

FONT_CANDIDATES = [
    r"C:\Windows\Fonts\msyh.ttc",
    r"C:\Windows\Fonts\simhei.ttf",
    r"C:\Windows\Fonts\simsun.ttc",
]


def get_font_path() -> str:
    for candidate in FONT_CANDIDATES:
        if Path(candidate).exists():
            return candidate
    raise RuntimeError("No Chinese font found")


FONT_PATH = get_font_path()


def font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_PATH, size)


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for char in text:
        test = current + char
        width = draw.textbbox((0, 0), test, font=fnt)[2]
        if width <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = char
    if current:
        lines.append(current)
    return lines


TITLES = [
    "已上架：公文材料助手 v0.2",
    "痛点：正式材料卡在细节",
    "三大能力：起草 / 审查 / 督办",
    "处理链路：稳定、可解释、可部署",
    "Review：提交前做材料体检",
    "Draft + Brief：写前起草，会后跟进",
    "鲁棒性：15 项测试 + 21 项预检",
    "专家榜：稳定性打底，场景价值拉开差距",
    "热度榜：把收藏 + 下载说清楚",
    "下一步：搜索、收藏、下载",
]

NOTES = [
    "口播：我做了一个讯飞 SkillHub 参赛作品，叫 official-document-assistant。",
    "口播：很多材料不是不会写，而是标题、主送、落款、日期这些细节容易错。",
    "口播：它不是泛泛聊天助手，而是围绕正式材料做三个动作。",
    "口播：先清洗输入，再识别文种，最后给出规则检查、模板或督办清单。",
    "口播：review 模式会输出风险等级、问题清单和修改建议。",
    "口播：draft 负责生成草稿骨架，brief 负责提取会议督办事项。",
    "口播：参赛版优先保证不崩、能跑、可解释。",
    "口播：专家评审看稳定性、应用价值、结果质量和安全合规。",
    "口播：发抖音时一定要明确，热度榜看收藏和下载。",
    "口播：如果觉得有用，去 SkillHub 搜 official-document-assistant，帮我收藏和下载。",
]


def main() -> None:
    OUT_DIR.mkdir(exist_ok=True)
    for old in OUT_DIR.glob("*.png"):
        old.unlink()

    width, height = 1080, 1920
    bg = (17, 24, 39)
    paper = (247, 245, 239)
    white = (255, 255, 255)
    muted = (210, 218, 232)
    violet = (109, 93, 251)
    mint = (37, 194, 138)
    amber = (242, 169, 59)

    slide_files = sorted(SLIDE_DIR.glob("*.PNG"))
    if len(slide_files) != 10:
        raise RuntimeError(f"Expected 10 slide PNGs, found {len(slide_files)}")

    for index, slide_path in enumerate(slide_files, start=1):
        image = Image.new("RGB", (width, height), bg)
        draw = ImageDraw.Draw(image)

        accent = violet if index % 3 == 1 else mint if index % 3 == 2 else amber
        draw.rectangle([0, 0, width, 20], fill=accent)
        draw.text((70, 72), f"official-document-assistant · {index:02d}/10", font=font(30), fill=mint)

        title_font = font(58)
        y = 135
        for line in wrap(draw, TITLES[index - 1], title_font, width - 140):
            draw.text((70, y), line, font=title_font, fill=white)
            y += 72

        slide = Image.open(slide_path).convert("RGB")
        slide_width = 960
        slide_height = int(slide_width * 720 / 1280)
        slide = slide.resize((slide_width, slide_height), Image.LANCZOS)
        sx = (width - slide_width) // 2
        sy = 420
        draw.rounded_rectangle(
            [sx - 12, sy - 12, sx + slide_width + 12, sy + slide_height + 12],
            radius=24,
            fill=(255, 255, 255),
            outline=(216, 214, 204),
            width=3,
        )
        image.paste(slide, (sx, sy))

        note_y = 1035
        draw.rounded_rectangle([70, note_y, 1010, note_y + 330], radius=28, fill=paper)
        draw.text((110, note_y + 45), "配音提示", font=font(38), fill=(17, 24, 39))
        note_font = font(36)
        yy = note_y + 110
        for line in wrap(draw, NOTES[index - 1], note_font, 850):
            draw.text((110, yy), line, font=note_font, fill=(17, 24, 39))
            yy += 52

        draw.rounded_rectangle([70, 1435, 1010, 1628], radius=28, fill=(30, 41, 59))
        draw.text((110, 1478), "置顶评论：SkillHub 搜 official-document-assistant", font=font(34), fill=white)
        draw.text((110, 1534), "支持方式：收藏 + 下载，这两个动作计入热度榜", font=font(34), fill=mint)
        draw.text((70, 1810), "https://skill.xfyun.cn/space/global/official-document-assistant", font=font(25), fill=muted)

        image.save(OUT_DIR / f"frame-{index:02d}.png")

    print(f"frames={len(list(OUT_DIR.glob('*.png')))} dir={OUT_DIR}")


if __name__ == "__main__":
    main()
