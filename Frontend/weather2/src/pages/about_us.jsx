import { Link } from 'react-router-dom'
import { ArrowLeft, CloudSun, Wifi, Server, LayoutDashboard, Users, Target, Flag, MapPin } from 'lucide-react'
import Poster from '../images/poster.png'
import Painpoint from '../images/pain-point.png'

const SectionTitle = ({ children }) => (
    <div className='w-[90%] md:w-[70%] max-w-5xl flex items-center gap-2 md:gap-4'>
        <div className='h-[2px] w-6 md:w-12 bg-gradient-to-r from-blue-500 to-transparent'></div>
        <h2 className='text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white shrink-0'>{children}</h2>
        <div className='h-[2px] flex-1 bg-gradient-to-l from-transparent to-white/10'></div>
    </div>
)

const FrameworkCard = ({ icon: Icon, number, title, description }) => (
    <div className='msn-glass msn-card-hover rounded-xl p-4 md:p-5 flex gap-3 md:gap-4 items-start'>
        <div className='flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center'>
            <Icon className='w-5 h-5 md:w-6 md:h-6 text-blue-400' />
        </div>
        <div>
            <div className='flex items-center gap-2 mb-1'>
                <span className='text-[10px] md:text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full'>{number}</span>
                <h3 className='font-semibold text-white text-sm md:text-base'>{title}</h3>
            </div>
            <p className='text-xs md:text-sm text-white/70 leading-relaxed'>{description}</p>
        </div>
    </div>
)

const ObjectiveCard = ({ number, text }) => (
    <div className='msn-glass msn-card-hover rounded-xl p-4 md:p-5 flex gap-3 md:gap-4 items-start'>
        <div className='flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-base md:text-lg shadow-lg shadow-blue-600/20'>
            {number}
        </div>
        <p className='text-xs md:text-sm text-white/80 leading-relaxed flex-1'>{text}</p>
    </div>
)

const TargetGroupCard = ({ emoji = "🎯", label, detail }) => (
    <div className='msn-glass msn-card-hover rounded-xl p-4 flex items-center gap-3'>
        <span className='text-2xl flex-shrink-0'>{emoji}</span>
        <div>
            <div className='font-semibold text-white text-sm'>{label}</div>
            <div className='text-xs text-white/60 leading-normal'>{detail}</div>
        </div>
    </div>
)

const AboutUs = () => {
    return (
        <div className="w-full min-h-screen flex flex-col items-center p-0 m-0 overflow-y-auto gap-6 md:gap-8 pt-24 pb-16">
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
                <Link to="/" className="w-14 sm:w-20 h-9 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
            </div>

            {/* ===== เกี่ยวกับโครงการวิจัย ===== */}
            <SectionTitle>เกี่ยวกับโครงการวิจัย</SectionTitle>

            <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-2 h-auto md:h-120 w-[90%] md:w-[70%] max-w-5xl msn-glass backdrop-blur-sm rounded-2xl p-2">
                <div className='w-full md:flex-1 h-64 sm:h-80 md:h-full overflow-hidden p-3 md:p-5'>
                    <img src={Poster} alt="โปสเตอร์โครงการ" className='w-full h-full object-contain' />
                </div>
                <div className='w-full md:flex-1 rounded-2xl msn-glass p-4 md:p-5 flex flex-col justify-center'>
                    <div className='text-xs md:text-sm leading-relaxed indent-8 text-white/80 text-justify'>
                        <p>โครงการวิจัย
                            <span className='text-blue-400 mx-1 font-medium'>"การพัฒนาแอปพลิเคชันแดชบอร์ดข้อมูลสภาพอากาศแบบเรียลไทม์บนระบบคลาวด์ผ่านการสื่อสารไร้สายระยะไกลเพื่อส่งเสริมการเกษตรมูลค่าสูงในพื้นที่อำเภอพบพระ จังหวัดตาก"</span>
                            เป็นงานวิจัยประยุกต์ที่มุ่งพัฒนาระบบสารสนเทศด้านสภาพอากาศสำหรับการใช้งานจริงในพื้นที่เกษตร โดยใช้เทคโนโลยีสถานีตรวจวัดอากาศ การสื่อสารไร้สายระยะไกล ระบบคลาวด์
                            และแดชบอร์ดข้อมูล เพื่อช่วยให้ผู้ใช้งานเข้าถึงข้อมูลสภาพอากาศได้อย่างถูกต้อง ทันเวลา และเข้าใจง่าย ซึ่งจะนำไปสู่การวางแผนการเพาะปลูก การจัดการทรัพยากร
                            และการลดความเสี่ยงจากสภาพอากาศที่ไม่แน่นอนได้อย่างมีประสิทธิภาพมากยิ่งขึ้น
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== บทสรุปข้อเสนอโครงการ ===== */}
            <SectionTitle>บทสรุปข้อเสนอโครงการ</SectionTitle>

            <div className='w-[90%] md:w-[70%] max-w-5xl msn-glass rounded-2xl p-4 md:p-6 space-y-4'>
                <p className='indent-8 leading-relaxed text-justify text-white/80 text-xs md:text-sm'>พื้นที่จังหวัดตาก โดยเฉพาะอำเภอพบพระ มีศักยภาพในการผลิตสินค้าเกษตรมูลค่าสูง เช่น กาแฟ อะโวคาโด และโกโก้ ซึ่งเป็นพืชที่สร้างมูลค่าทางเศรษฐกิจได้ดี แต่การผลิตพืชเหล่านี้มีความอ่อนไหวต่อสภาพอากาศและอุณหภูมิในแต่ละช่วงเวลา ผู้ผลิตจึงต้องการข้อมูลอากาศที่แม่นยำและเป็นปัจจุบัน เพื่อใช้ประกอบการตัดสินใจในการจัดการแปลง การให้น้ำ และการวางแผนการผลิตอย่างเหมาะสม</p>
                <p className='indent-8 leading-relaxed text-justify text-white/80 text-xs md:text-sm'>โครงการนี้จึงมุ่งพัฒนาระบบที่เชื่อมโยงข้อมูลจากสถานีตรวจวัดอากาศเข้าสู่ระบบคลาวด์ และแสดงผลผ่านแดชบอร์ดที่เข้าถึงได้ง่ายทั้งบนสมาร์ตโฟนและเว็บไซต์ เพื่อช่วยเพิ่มประสิทธิภาพการผลิต ลดความสูญเสีย และยกระดับศักยภาพของเกษตรกรและผู้ประกอบการในพื้นที่อย่างเป็นรูปธรรม</p>
            </div>

            {/* ===== หลักการและเหตุผล ===== */}
            <SectionTitle>หลักการและเหตุผล / โจทย์การวิจัย</SectionTitle>

            <div className='w-[90%] md:w-[60%] max-w-4xl h-auto msn-glass backdrop-blur-sm rounded-2xl p-2 md:p-4'>
                <img src={Painpoint} alt="ปัญหาและโจทย์การวิจัย" className='w-full h-auto object-contain rounded-lg' />
            </div>
            <div className='w-[90%] md:w-[70%] max-w-5xl msn-glass rounded-2xl p-4 md:p-6'>
                <p className='indent-8 leading-relaxed text-justify text-white/80 text-xs md:text-sm'>นอกจากนี้ การสื่อสารข้อมูลในพื้นที่เกษตรยังมีข้อจำกัดในด้านความครอบคลุมของเครือข่าย รวมถึงความท้าทายในการนำเทคโนโลยีใหม่ เช่น ระบบคลาวด์และแดชบอร์ด มาใช้ให้เหมาะกับผู้ใช้งานในพื้นที่ จึงเกิดโจทย์สำคัญของงานวิจัยนี้ คือ การพัฒนาระบบรายงานผลข้อมูลสภาพอากาศแบบเรียลไทม์ที่เข้าถึงง่าย ใช้งานได้จริง และสามารถกำหนดสิทธิ์การเข้าถึงข้อมูลตามระดับผู้ใช้งานได้อย่างเหมาะสม</p>
            </div>

            {/* ===== กรอบการวิจัย / พัฒนา ===== */}
            <SectionTitle>กรอบการวิจัย / พัฒนา</SectionTitle>

            <p className='indent-8 w-[90%] md:w-[70%] max-w-5xl leading-relaxed text-justify text-white/80 text-xs md:text-sm -mt-2'>โครงการนี้พัฒนาระบบโดยอาศัยองค์ประกอบสำคัญที่ทำงานเชื่อมโยงกันเป็นลำดับ ดังนี้</p>

            <div className='w-[90%] md:w-[70%] max-w-5xl grid grid-cols-1 gap-3'>
                <FrameworkCard
                    icon={CloudSun} number="01"
                    title="สถานีตรวจวัดสภาพอากาศ (Weather Stations)"
                    description="ติดตั้งในพื้นที่เพาะปลูกเพื่อเก็บข้อมูล เช่น อุณหภูมิ ความชื้น ปริมาณน้ำฝน และความเร็วลม"
                />
                <FrameworkCard
                    icon={Wifi} number="02"
                    title="การสื่อสารไร้สายระยะไกล (Long-Range Wireless Communication)"
                    description="ใช้เทคโนโลยีสื่อสาร เช่น LoRaWAN เพื่อส่งข้อมูลจากสถานีตรวจวัดไปยังระบบกลางได้ครอบคลุมพื้นที่และมีความเสถียร"
                />
                <FrameworkCard
                    icon={Server} number="03"
                    title="ระบบคลาวด์ (Cloud System)"
                    description="ทำหน้าที่จัดเก็บ รวบรวม และประมวลผลข้อมูลสภาพอากาศให้เป็นข้อมูลที่พร้อมใช้งาน"
                />
                <FrameworkCard
                    icon={LayoutDashboard} number="04"
                    title="แอปพลิเคชันแดชบอร์ดการวิเคราะห์ข้อมูล (Dashboard Application)"
                    description="แสดงผลข้อมูลสภาพอากาศแบบเรียลไทม์ในรูปแบบที่เข้าใจง่าย รองรับทั้งการใช้งานบนเว็บและอุปกรณ์พกพา"
                />
                <FrameworkCard
                    icon={Users} number="05"
                    title="ผู้ใช้งาน (Users)"
                    description="ได้แก่ เกษตรกร ผู้ประกอบการ หน่วยงานในพื้นที่ สถานศึกษา และประชาชนผู้สนใจ ซึ่งสามารถนำข้อมูลไปใช้ในการวางแผนและตัดสินใจได้จริงในบริบทของพื้นที่"
                />
            </div>

            <div className='w-[90%] md:w-[70%] max-w-5xl msn-glass rounded-2xl p-4 md:p-6'>
                <p className='indent-8 leading-relaxed text-justify text-white/80 text-xs md:text-sm'>กล่าวโดยสรุป ข้อมูลจากสถานีตรวจวัดจะถูกส่งผ่านเครือข่ายไร้สายเข้าสู่ระบบคลาวด์ ก่อนจะถูกประมวลผลและนำเสนอผ่านแดชบอร์ด เพื่อให้ผู้ใช้งานสามารถเข้าถึงข้อมูลและใช้ประโยชน์ได้อย่างมีประสิทธิภาพ</p>
            </div>

            {/* ===== วัตถุประสงค์ ===== */}
            <div className='w-[90%] md:w-[70%] max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent'></div>

            <SectionTitle>วัตถุประสงค์</SectionTitle>

            <div className='w-[90%] md:w-[70%] max-w-5xl grid grid-cols-1 gap-3'>
                <ObjectiveCard number={1} text="เพื่อศึกษาวิธีการและแนวทางการจัดการทรัพยากรทางการเกษตรในการใช้ข้อมูลสภาพอากาศ และลดความเสี่ยงจากสภาพอากาศที่ไม่แน่นอน" />
                <ObjectiveCard number={2} text="เพื่อสร้างแอปพลิเคชันแดชบอร์ดที่สามารถรวบรวมและวิเคราะห์ข้อมูลสภาพอากาศจากสถานีตรวจวัด โดยใช้เทคโนโลยีไอโอทีและการสื่อสารไร้สายระยะไกล เพื่อส่งเสริมการเกษตรมูลค่าสูงในพื้นที่อำเภอพบพระ จังหวัดตาก" />
                <ObjectiveCard number={3} text="เพื่อให้เกษตรกรและผู้ประกอบการในภาคการเกษตรสามารถนำข้อมูลจากแอปพลิเคชันแดชบอร์ดไปใช้ในการติดตามและวางแผนการเพาะปลูกและการผลิตได้อย่างมีประสิทธิภาพ" />
            </div>

            {/* ===== เป้าหมาย ===== */}
            <div className='w-[90%] md:w-[70%] max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent'></div>

            <div className='w-[90%] md:w-[70%] max-w-5xl flex items-center gap-2 md:gap-4'>
                <div className='h-[2px] w-6 md:w-12 bg-gradient-to-r from-blue-500 to-transparent'></div>
                <div className='flex items-center gap-2 md:gap-3 shrink-0'>
                    <Flag className='w-5 h-5 md:w-7 md:h-7 text-blue-400' />
                    <h2 className='text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white'>เป้าหมาย</h2>
                </div>
                <div className='h-[2px] flex-1 bg-gradient-to-l from-transparent to-white/10'></div>
            </div>

            <div className='w-[90%] md:w-[70%] max-w-5xl msn-glass rounded-2xl p-4 md:p-6'>
                <p className='indent-8 leading-relaxed text-justify text-white/80 text-xs md:text-sm'>โครงการมีเป้าหมายเพื่อพัฒนาระบบต้นแบบที่สามารถรายงานข้อมูลสภาพอากาศแบบเรียลไทม์ให้กับผู้ใช้งานในพื้นที่ได้อย่างสะดวกและใช้งานได้จริง ผ่านอุปกรณ์สมาร์ตโฟนหรือเว็บไซต์ ควบคู่กับการวางระบบสิทธิ์การเข้าถึงข้อมูลตามกลุ่มผู้ใช้ การติดตั้งและทดสอบสถานีตรวจวัดสภาพอากาศในพื้นที่เพาะปลูก การฝึกอบรมผู้ใช้งาน และการขยายผลไปยังพื้นที่อื่นในอนาคต โดยอ้างอิงจากความต้องการจริงของผู้ใช้งานในจังหวัดตาก</p>
            </div>

            {/* ===== กลุ่มเป้าหมาย ===== */}
            <div className='w-[90%] md:w-[70%] max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent'></div>

            <div className='w-[90%] md:w-[70%] max-w-5xl flex items-center gap-2 md:gap-4'>
                <div className='h-[2px] w-6 md:w-12 bg-gradient-to-r from-blue-500 to-transparent'></div>
                <div className='flex items-center gap-2 md:gap-3 shrink-0'>
                    <Target className='w-5 h-5 md:w-7 md:h-7 text-blue-400' />
                    <h2 className='text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white'>กลุ่มเป้าหมาย</h2>
                </div>
                <div className='h-[2px] flex-1 bg-gradient-to-l from-transparent to-white/10'></div>
            </div>

            <p className='w-[90%] md:w-[70%] max-w-5xl text-xs md:text-sm text-white/70 -mt-2'>กลุ่มเป้าหมายของโครงการประกอบด้วย</p>

            <div className='w-[90%] md:w-[70%] max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <TargetGroupCard emoji="🏛️" label="ภาครัฐ" detail="สำนักงานเกษตรจังหวัดตาก และสถานีอุตุนิยมวิทยาจังหวัดตาก" />
                <TargetGroupCard emoji="🏢" label="ภาคเอกชน" detail="กลุ่มหอการค้าจังหวัดตาก" />
                <TargetGroupCard emoji="🤝" label="วิสาหกิจชุมชน / สหกรณ์" detail="กลุ่มวิสาหกิจชุมชนของผลผลิตเกษตรมูลค่าสูง" />
                <TargetGroupCard emoji="🚛" label="ผู้ประกอบการระดับบุคคล / ครัวเรือน" detail="ผู้ประกอบการขนส่งผลผลิตการเกษตรมูลค่าสูง" />
                <TargetGroupCard emoji="🏘️" label="ชุมชน" detail="ชุมชนในอำเภอพบพระ" />
                <TargetGroupCard emoji="🌾" label="ประชาชนทั่วไป" detail="เกษตรกรที่เพาะปลูกพืชผลเกษตรมูลค่าสูง" />
            </div>

            {/* ===== พื้นที่ใช้งาน ===== */}
            <div className='w-[90%] md:w-[70%] max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent'></div>

            <div className='w-[90%] md:w-[70%] max-w-5xl flex items-center gap-2 md:gap-4'>
                <div className='h-[2px] w-6 md:w-12 bg-gradient-to-r from-blue-500 to-transparent'></div>
                <div className='flex items-center gap-2 md:gap-3 shrink-0'>
                    <MapPin className='w-5 h-5 md:w-7 md:h-7 text-blue-400' />
                    <h2 className='text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white'>พื้นที่ใช้งาน</h2>
                </div>
                <div className='h-[2px] flex-1 bg-gradient-to-l from-transparent to-white/10'></div>
            </div>

            <div className='w-[90%] md:w-[70%] max-w-5xl msn-glass rounded-2xl p-4 md:p-6'>
                <p className='indent-8 leading-relaxed text-justify text-white/80 text-xs md:text-sm'>พื้นที่ใช้งานหลัก of โครงการคือ <span className='text-blue-400 font-medium'>อำเภอพบพระ จังหวัดตาก</span> ซึ่งเป็นพื้นที่เกษตรที่มีศักยภาพในการผลิตพืชมูลค่าสูง และมีความต้องการใช้ข้อมูลสภาพอากาศเพื่อสนับสนุนการวางแผนและการจัดการการผลิตอย่างแม่นยำ โครงการยังมีแนวโน้มขยายผลไปยังพื้นที่อื่นในจังหวัดตากในระยะต่อไป ตามผลการวิจัยและความต้องการของผู้ใช้งานจริงในพื้นที่</p>
            </div>

            {/* Footer spacing */}
            <div className='h-4'></div>

        </div>
    )
}
export default AboutUs
