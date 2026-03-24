export default function AppleEmoji({ name, className = "w-6 h-6 inline-block" }) {
  const emojiMap = {
    soccer: "26bd",
    chart: "1f4ca",
    star: "1f31f",
    lightning: "26a1",
    camera: "1f4f8"
  };
  
  const code = emojiMap[name] || "26bd";
  // Fallback to high-resolution Apple emojis from CDNJS
  const url = `https://cdnjs.cloudflare.com/ajax/libs/emoji-datasource-apple/15.0.1/img/apple/64/${code}.png`;
  
  return <img src={url} alt={name} className={className} loading="lazy" />;
}
