import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowLeft, CloudSun, Wifi, Server, LayoutDashboard, Users, Target, Flag, MapPin, X, ZoomIn } from 'lucide-react'
import Poster from '../images/poster.png'
import Painpoint from '../images/pain-point.png'

// Component for Section Titles
const SectionTitle = ({ children }) => (
    <div className='w-[90%] md:w-[70%] max-w-5xl flex items-center gap-2 md:gap-4 my-2 animate-msn-in'>
        <div className='h-[2px] w-6 md:w-12 bg-gradient-to-r from-blue-500 to-transparent'></div>
        <h2 className='text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white shrink-0'>{children}</h2>
        <div className='h-[2px] flex-1 bg-gradient-to-l from-transparent to-white/10'></div>
    </div>
)

// Interactive Card with Spotlight Mouse-following glow effect
const SpotlightCard = ({ children, className = "" }) => {
    const [coords, setCoords] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setCoords({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        })
    }

    return (
        <div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative overflow-hidden msn-glass rounded-xl p-4 md:p-5 flex gap-3 md:gap-4 items-start transition-all duration-300 ${className}`}
            style={{
                borderColor: isHovered ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: isHovered ? '0 12px 32px 0 rgba(37, 99, 235, 0.12)' : 'none'
            }}
        >
            {isHovered && (
                <div
                    className="absolute pointer-events-none rounded-full blur-[60px]"
                    style={{
                        width: '160px',
                        height: '160px',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, transparent 70%)',
                        left: `${coords.x - 80}px`,
                        top: `${coords.y - 80}px`,
                        transition: 'left 0.15s ease-out, top 0.15s ease-out'
                    }}
                />
            )}
            {children}
        </div>
    )
}

// Subcomponents for list layouts using the interactive card
const FrameworkCard = ({ icon: Icon, number, title, description }) => (
    <SpotlightCard className="w-full">
        <div className='flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center relative z-10'>
            <Icon className='w-5 h-5 md:w-6 md:h-6 text-blue-400' />
        </div>
        <div className="relative z-10">
            <div className='flex items-center gap-2 mb-1'>
                <span className='text-[10px] md:text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full'>{number}</span>
                <h3 className='font-semibold text-white text-sm md:text-base'>{title}</h3>
            </div>
            <p className='text-xs md:text-sm text-white/70 leading-relaxed'>{description}</p>
        </div>
    </SpotlightCard>
)

const ObjectiveCard = ({ number, text }) => (
    <SpotlightCard className="w-full">
        <div className='flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-base md:text-lg shadow-lg shadow-blue-600/20 relative z-10'>
            {number}
        </div>
        <p className='text-xs md:text-sm text-white/80 leading-relaxed flex-1 relative z-10 pt-1'>{text}</p>
    </SpotlightCard>
)

const TargetGroupCard = ({ emoji = "", label, detail }) => (
    <SpotlightCard className="w-full items-center">
        <span className='text-2xl flex-shrink-0 relative z-10'>{emoji}</span>
        <div className="relative z-10">
            <div className='font-semibold text-white text-sm'>{label}</div>
            <div className='text-xs text-white/60 leading-normal'>{detail}</div>
        </div>
    </SpotlightCard>
)

const AboutUs = () => {
    const [scrollProgress, setScrollProgress] = useState(0)
    const [activeTab, setActiveTab] = useState('objectives')
    const [lightboxImage, setLightboxImage] = useState(null)

    // Track scroll progress
    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight
            if (totalScroll > 0) {
                setScrollProgress((window.scrollY / totalScroll) * 100)
            }
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const frameworkItems = [
        {
            icon: CloudSun,
            number: "01",
            title: "สถานีตรวจวัดสภาพอากาศ (Weather Stations)",
            description: "ติดตั้งในแปลงเกษตรเพื่อตรวจวัดอุณหภูมิ ความชื้น ปริมาณน้ำฝน และความเร็วลมโดยตรง"
        },
        {
            icon: Wifi,
            number: "02",
            title: "การสื่อสารไร้สายระยะไกล (Long-Range Wireless Communication)",
            description: "ใช้เทคโนโลยี LoRaWAN ส่งข้อมูลจากสถานีวัดไปยังเกตเวย์ได้อย่างครอบคลุมและเสถียรแม้พื้นที่ห่างไกล"
        },
        {
            icon: Server,
            number: "03",
            title: "ระบบคลาวด์ (Cloud System)",
            description: "จัดเก็บ ประมวลผล และสำรองข้อมูลสภาพอากาศในคลาวด์ให้พร้อมเรียกใช้งานตลอด 24 ชั่วโมง"
        },
        {
            icon: LayoutDashboard,
            number: "04",
            title: "แอปพลิเคชันแดชบอร์ด (Dashboard Application)",
            description: "แสดงผลข้อมูลสภาพอากาศแบบเรียลไทม์ในรูปแบบกราฟและแผนที่ที่เข้าใจง่าย รองรับทั้งเว็บและมือถือ"
        },
        {
            icon: Users,
            number: "05",
            title: "ผู้ใช้งาน (Users)",
            description: "เกษตรกร ผู้ประกอบการ และหน่วยงานในพื้นที่ นำข้อมูลเชิงลึกไปใช้วางแผนเพาะปลูกและตัดสินใจได้ทันที"
        }
    ];

    return (
        <div className="w-full min-h-screen flex flex-col items-center p-0 m-0 overflow-y-auto gap-6 md:gap-8 pt-24 pb-16 relative bg-[#0F172A] text-white font-outfit selection:bg-blue-500/30">

            {/* Elegant Scroll Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-[100]">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-75"
                    style={{ width: `${scrollProgress}%` }}
                ></div>
            </div>

            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full"></div>
            </div>

            {/* Navbar */}
            <div className="fixed top-4 sm:top-6 z-50 msn-glass w-[90%] h-14 sm:h-15 max-w-6xl rounded-2xl flex justify-between items-center px-4 sm:px-6 transition-all duration-500 hover:border-white/20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <span className="font-bold text-white text-sm">L</span>
                    </div>
                    <div className="text-sm sm:text-lg font-bold tracking-tight text-white">
                        LookData <span className="text-blue-400">Weather</span>
                    </div>
                </div>
                <Link to="/" className="w-14 sm:w-20 h-9 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
            </div>

            {/* ===== เกี่ยวกับโครงการวิจัย ===== */}
            <SectionTitle>เกี่ยวกับโครงการวิจัย</SectionTitle>

            <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-4 h-auto w-[90%] md:w-[70%] max-w-5xl msn-glass backdrop-blur-sm rounded-2xl p-4 animate-msn-in">
                {/* Poster Image Box with click-to-zoom indicator */}
                <div
                    onClick={() => setLightboxImage({ src: Poster, alt: "โปสเตอร์โครงการ" })}
                    className='w-full h-64 sm:h-80 md:h-96 overflow-hidden rounded-xl border border-white/5 bg-slate-950/30 relative group cursor-zoom-in'
                >
                    <img src={Poster} alt="โปสเตอร์โครงการ" className='w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105' />
                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="w-10 h-10 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <ZoomIn className="w-5 h-5 text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className='w-full rounded-2xl flex flex-col justify-center gap-4 py-2'>
                    <div className='text-xs md:text-sm leading-relaxed text-white/80 text-justify space-y-4'>
                        <p className="indent-8">
                            โครงการวิจัย
                            <span className='text-blue-400 font-semibold mx-1'>"การพัฒนาแอปพลิเคชันแดชบอร์ดข้อมูลสภาพอากาศแบบเรียลไทม์บนระบบคลาวด์ผ่านการสื่อสารไร้สายระยะไกลเพื่อส่งเสริมการเกษตรมูลค่าสูงในพื้นที่อำเภอพบพระ จังหวัดตาก"</span>
                            เป็นงานวิจัยประยุกต์ที่มุ่งพัฒนาระบบสารสนเทศด้านสภาพอากาศสำหรับการใช้งานจริงในพื้นที่เกษตรกรรม
                        </p>
                        <p className="indent-8">
                            การบูรณาการเทคโนโลยีสถานีวัดอากาศ เครือข่ายสื่อสารไร้สายระยะไกล ระบบคลาวด์ และแดชบอร์ดข้อมูล จะช่วยให้เกษตรกรสามารถเข้าถึงข้อมูลอากาศที่ถูกต้อง แม่นยำ และรวดเร็ว เพื่อนำไปใช้วางแผนการเพาะปลูก บริหารทรัพยากรน้ำ และจำกัดความเสียหายจากความแปรปรวนของสภาพอากาศได้อย่างมีประสิทธิภาพสูงสุด
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== บทสรุปข้อเสนอโครงการ ===== */}
            <SectionTitle>บทสรุปข้อเสนอโครงการ</SectionTitle>

            <div className='w-[90%] md:w-[70%] max-w-5xl msn-glass rounded-2xl p-5 md:p-6 space-y-4 animate-msn-in'>
                <p className='indent-8 leading-relaxed text-justify text-white/80 text-xs md:text-sm'>
                    **อำเภอพบพระ จังหวัดตาก** เป็นพื้นที่ที่มีศักยภาพการผลิตพืชเศรษฐกิจมูลค่าสูง เช่น กาแฟ อะโวคาโด และโกโก้ ทว่าพืชเหล่านี้มีความอ่อนไหวต่อระดับอุณหภูมิและความชื้นค่อนข้างสูง เกษตรกรจึงมีความจำเป็นต้องใช้ข้อมูลสภาพอากาศที่แม่นยำเพื่อสนับสนุนการวิเคราะห์ การบริหารน้ำ และการตัดสินใจจัดการแปลงเพาะปลูก
                </p>
                <p className='indent-8 leading-relaxed text-justify text-white/80 text-xs md:text-sm'>
                    โครงการนี้จึงได้พัฒนาโซลูชันเชื่อมโยงข้อมูลจากสถานีตรวจวัดอากาศเข้าสู่ระบบคลาวด์ เพื่อนำเสนอข้อมูลเรียลไทม์บนเว็บไซต์และอุปกรณ์เคลื่อนที่ ช่วยเกษตรกรและผู้ประกอบการเพิ่มประสิทธิภาพผลผลิต ลดอัตราความสูญเสีย และยกระดับขีดความสามารถการทำเกษตรอัจฉริยะอย่างเป็นรูปธรรม
                </p>
            </div>

            {/* ===== หลักการและเหตุผล ===== */}
            <SectionTitle>หลักการและเหตุผล / โจทย์การวิจัย</SectionTitle>

            {/* Interactive Image box with zoom */}
            <div
                onClick={() => setLightboxImage({ src: Painpoint, alt: "ปัญหาและโจทย์การวิจัย" })}
                className='w-[90%] md:w-[60%] max-w-4xl h-auto msn-glass backdrop-blur-sm rounded-2xl p-2 md:p-3 relative group cursor-zoom-in overflow-hidden animate-msn-in'
            >
                <img src={Painpoint} alt="ปัญหาและโจทย์การวิจัย" className='w-full h-auto object-contain rounded-lg transition-transform duration-500 group-hover:scale-[1.01]' />
                <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <ZoomIn className="w-6 h-6 text-blue-400" />
                    </div>
                </div>
            </div>

            <div className='w-[90%] md:w-[70%] max-w-5xl msn-glass rounded-2xl p-5 md:p-6 animate-msn-in'>
                <p className='indent-8 leading-relaxed text-justify text-white/80 text-xs md:text-sm'>
                    เนื่องจากการรับส่งข้อมูลในพื้นที่การเกษตรส่วนใหญ่มักประสบข้อจำกัดด้านสัญญาณเครือข่ายและความยุ่งยากในการใช้เครื่องมือเทคโนโลยีสมัยใหม่ โจทย์วิจัยของโครงการนี้จึงครอบคลุมการพัฒนาระบบสื่อสารสภาพอากาศในพื้นที่ห่างไกล โดยมุ่งประเด็นไปที่ความคงทนและเข้าถึงง่ายของแดชบอร์ด ควบคู่กับการออกแบบสิทธิ์ของสมาชิกผู้ใช้แต่ละกลุ่มเพื่อความสะดวกและความเป็นระเบียบเรียบร้อยของระบบ
                </p>
            </div>

            {/* ===== กรอบการวิจัย / พัฒนา ===== */}
            <SectionTitle>กรอบการพัฒนาและเชื่อมโยงระบบ</SectionTitle>

            <div className='w-[90%] md:w-[70%] max-w-5xl grid grid-cols-1 gap-3'>
                {frameworkItems.map((item, idx) => (
                    <div
                        key={item.number}
                        className="animate-msn-in"
                        style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
                    >
                        <FrameworkCard
                            icon={item.icon}
                            number={item.number}
                            title={item.title}
                            description={item.description}
                        />
                    </div>
                ))}
            </div>

            {/* Divider line */}
            <div className='w-[90%] md:w-[70%] max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-4'></div>

            {/* Interactive Dynamic Tab Container */}
            <div className="w-[90%] md:w-[70%] max-w-5xl flex flex-wrap gap-1 md:gap-2 justify-center bg-white/5 backdrop-blur-md rounded-2xl p-1.5 border border-white/5 shadow-inner">
                <button
                    onClick={() => setActiveTab('objectives')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 cursor-pointer ${activeTab === 'objectives' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    วัตถุประสงค์
                </button>
                <button
                    onClick={() => setActiveTab('goals')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 cursor-pointer ${activeTab === 'goals' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    เป้าหมาย
                </button>
                <button
                    onClick={() => setActiveTab('targets')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 cursor-pointer ${activeTab === 'targets' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    กลุ่มเป้าหมาย
                </button>
                <button
                    onClick={() => setActiveTab('location')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 cursor-pointer ${activeTab === 'location' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    พื้นที่ใช้งาน
                </button>
            </div>

            {/* Dynamic tab contents */}
            <div className="w-[90%] md:w-[70%] max-w-5xl transition-all duration-500 min-h-[180px]">
                {activeTab === 'objectives' && (
                    <div className="grid grid-cols-1 gap-3 animate-msn-in">
                        <ObjectiveCard number={1} text="เพื่อศึกษาแนวทางการวิเคราะห์สภาพอากาศเชิงลึกและสร้างระบบช่วยลดระดับความเสี่ยงจากอากาศแปรปรวนในพื้นที่เกษตร" />
                        <ObjectiveCard number={2} text="เพื่อพัฒนาระบบ IoT แดชบอร์ด รวบรวมข้อมูลจากสถานีตรวจวัดสภาพอากาศผ่านสัญญาณไร้สายระยะไกลเข้าคลาวด์เพื่อการเกษตรมูลค่าสูง" />
                        <ObjectiveCard number={3} text="เพื่อส่งเสริมและถ่ายทอดทักษะให้เกษตรกรสามารถประยุกต์ใช้แดชบอร์ดอากาศในการเพิ่มปริมาณและคุณภาพของพืชเศรษฐกิจ" />
                    </div>
                )}

                {activeTab === 'goals' && (
                    <div className="msn-glass rounded-2xl p-5 md:p-6 animate-msn-in flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                            <Flag className="w-5 h-5" />
                        </div>
                        <p className='leading-relaxed text-justify text-white/80 text-xs md:text-sm'>
                            เป้าหมายหลักคือการพัฒนาระบบต้นแบบรายงานสภาพอากาศเรียลไทม์ที่พร้อมใช้งานจริง ติดตั้งสถานีวัดอากาศในพื้นที่การเกษตร จัดฝึกอบรมเกษตรกร และกำหนดสิทธิ์ใช้งานตามกลุ่มผู้ใช้ เพื่อสร้างโมเดลระบบเกษตรอัจฉริยะที่ตอบโจทย์จังหวัดตากและพร้อมขยายผลสู่พื้นที่อื่นๆ ในอนาคต
                        </p>
                    </div>
                )}

                {activeTab === 'targets' && (
                    <div className="flex flex-col gap-4 animate-msn-in">
                        <p className='text-xs md:text-sm text-white/70 pl-2'>กลุ่มเป้าหมายของโครงการประกอบด้วย:</p>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                            <TargetGroupCard label="ภาครัฐ" detail="สำนักงานเกษตรจังหวัดตาก และสถานีอุตุนิยมวิทยาจังหวัดตาก" />
                            <TargetGroupCard label="ภาคเอกชน" detail="กลุ่มหอการค้าจังหวัดตาก" />
                            <TargetGroupCard label="วิสาหกิจชุมชน / สหกรณ์" detail="กลุ่มวิสาหกิจชุมชนของผลผลิตเกษตรมูลค่าสูง" />
                            <TargetGroupCard label="ผู้ประกอบการระดับบุคคล / ครัวเรือน" detail="ผู้ประกอบการขนส่งผลผลิตการเกษตรมูลค่าสูง" />
                            <TargetGroupCard label="ชุมชน" detail="ชุมชนในอำเภอพบพระ" />
                            <TargetGroupCard label="ประชาชนทั่วไป" detail="เกษตรกรที่เพาะปลูกพืชผลเกษตรมูลค่าสูง" />
                        </div>
                    </div>
                )}

                {activeTab === 'location' && (
                    <div className="msn-glass rounded-2xl p-5 md:p-6 animate-msn-in flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <p className='leading-relaxed text-justify text-white/80 text-xs md:text-sm'>
                            พื้นที่ดำเนินการหลักของโครงการคือ <span className='text-blue-400 font-semibold'>อำเภอพบพระ จังหวัดตาก</span> ซึ่งเป็นพื้นที่เพาะปลูกพืชเศรษฐกิจมูลค่าสูง และมีความต้องการใช้ข้อมูลสภาพอากาศอย่างละเอียดเพื่อสนับสนุนระบบเกษตรอัจฉริยะ ทั้งนี้โครงการยังมีแผนการวิจัยเพื่อวางแนวทางขยายผลไปยังสัดส่วนพื้นที่ข้างเคียงตามผลตอบรับความพึงพอใจจริง
                        </p>
                    </div>
                )}
            </div>

            {/* Premium Fullscreen Lightbox Modal */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-msn-in"
                    onClick={() => setLightboxImage(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[85vh] msn-glass p-2 rounded-2xl overflow-hidden flex flex-col items-center border border-white/10"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all text-white p-2 rounded-full cursor-pointer z-10 border border-white/10 shadow-lg"
                            onClick={() => setLightboxImage(null)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <img
                            src={lightboxImage.src}
                            alt={lightboxImage.alt}
                            className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                        />
                        <span className="text-white/70 text-xs font-semibold mt-3 mb-1 uppercase tracking-widest">{lightboxImage.alt}</span>
                    </div>
                </div>
            )}

            {/* Footer spacing */}
            <div className='h-4'></div>

        </div>
    )
}

export default AboutUs
