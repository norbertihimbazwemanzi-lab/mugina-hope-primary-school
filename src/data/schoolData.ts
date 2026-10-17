import { AcademicGrade, TimelineEvent, FacilityItem, Testimonial, FAQItem } from '../types';

const defaultSchoolInfo = {
  name: 'Mugina Hope Primary & Nursery Academy',
  shortName: 'Mugina Hope Academy',
  motto: 'We learn for our better future',
  mottoKinyarwanda: 'Twigira ejo hacu heza',
  establishedYear: 2014,
  location: {
    sector: 'Mugina Sector',
    district: 'Kamonyi District',
    province: 'Southern Province',
    country: 'Rwanda',
    landmark: 'Adjacent to Mugina Police Station',
    fullAddress: 'Mugina Center, Next to Mugina Police Post, Kamonyi District, Southern Province, Rwanda',
    drivingDistanceKigali: 'Approx. 42 km from Kigali (approx. 45–50 min via RN1 highway to Kamonyi)',
  },
  contact: {
    phone: '+250 788 258 786',
    phoneFormatted: '+250 788 258 786',
    whatsappUrl: 'https://wa.me/250788258786',
    email: 'norbertihimbazwemanzi@gmail.com',
    admissionsEmail: 'admissions@muginahopeschool.com',
    website: 'muginahopeschool.com',
    officialUrl: 'https://muginahopeschool.com',
  },
  operatingHours: [
    { days: 'Monday & Tuesday', time: '7:00 AM – 5:00 PM', note: 'Standard academic day & remedial study' },
    { days: 'Wednesday – Friday', time: '7:00 AM – 7:00 PM', note: 'Extended care, clubs & study hall' },
    { days: 'Saturday', time: '8:00 AM – 12:00 AM', note: 'Weekend sports, cultural Itorero & parent consultations' },
    { days: 'Sunday', time: 'Closed', note: 'Campus rest & maintenance' },
  ],
  stats: [
    { label: 'Year Established', value: '2014', subtext: 'Over 12 years of community educational leadership' },
    { label: 'Grade Levels', value: 'Nursery to P6', subtext: 'Comprehensive foundational & primary education' },
    { label: 'Student-Teacher Ratio', value: '18 : 1', subtext: 'Personalized care and active classroom participation' },
    { label: 'National Exam Pass Rate', value: '100%', subtext: 'Excellence in Rwanda REB primary leaving examinations' },
  ],
  images: {
    hero: '/src/assets/images/hero_mugina_hope_campus_1791823254957.jpg',
    nursery: '/src/assets/images/nursery_play_learning_1791823267251.jpg',
    primaryStem: '/src/assets/images/primary_stem_computer_lab_1791823280335.jpg',
    culturalDance: '/src/assets/images/campus_life_traditional_dance_1791823290926.jpg',
  }
};

function getLiveSavedSettings(): any {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem('mugina_website_settings_v3');
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
  }
  return null;
}

export const SCHOOL_INFO: typeof defaultSchoolInfo = new Proxy(defaultSchoolInfo, {
  get(target, prop: keyof typeof defaultSchoolInfo) {
    const saved = getLiveSavedSettings();
    if (!saved) return target[prop];

    if (prop === 'name') return saved.schoolName || target.name;
    if (prop === 'shortName') return saved.shortName || target.shortName;
    if (prop === 'motto') return saved.motto || target.motto;
    if (prop === 'mottoKinyarwanda') return saved.mottoKinyarwanda || target.mottoKinyarwanda;
    if (prop === 'location') {
      return {
        ...target.location,
        landmark: saved.landmark || target.location.landmark,
        fullAddress: saved.fullAddress || target.location.fullAddress,
      };
    }
    if (prop === 'contact') {
      const phone = saved.phone || target.contact.phone;
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      return {
        ...target.contact,
        phone,
        phoneFormatted: phone,
        whatsappUrl: `https://wa.me/${cleanPhone}`,
        email: saved.officialEmail || target.contact.email,
        admissionsEmail: saved.admissionsEmail || target.contact.admissionsEmail,
      };
    }
    return target[prop];
  }
});

export const ACADEMIC_GRADES: AcademicGrade[] = [
  {
    code: 'N-BABY',
    name: 'Baby Class',
    level: 'Nursery',
    ageRange: '3 Years',
    minAge: 3,
    maxAge: 3,
    description: 'Gentle introduction to social interaction, sensory motor activities, toilet training support, joyful nursery rhymes, and vocabulary.',
    keySubjects: ['Sensory Play', 'Early Vocabulary (EN & RW)', 'Basic Motor Skills', 'Story Circles', 'Nursery Music'],
    learningGoals: ['Confidence away from home', 'Sharing and gentle peer interaction', 'Colors, shapes & emotional recognition'],
    schedule: '7:30 AM – 12:30 PM (Half-day or full-day care available)'
  },
  {
    code: 'N-MID',
    name: 'Middle Class',
    level: 'Nursery',
    ageRange: '4 Years',
    minAge: 4,
    maxAge: 4,
    description: 'Play-based cognitive exploration, pre-writing pencil grip, counting up to 20, structured group activities, and bilingual conversational skills.',
    keySubjects: ['Letter & Sound Recognition', 'Counting & Sorting', 'Creative Arts & Crafts', 'Health & Hygiene Habits', 'Outdoor Physical Play'],
    learningGoals: ['Phonics fundamentals', 'Independent personal care', 'Curiosity and question formulation'],
    schedule: '7:30 AM – 1:00 PM (With lunch & supervised quiet hour)'
  },
  {
    code: 'N-TOP',
    name: 'Pre-Primary (Top Class)',
    level: 'Nursery',
    ageRange: '5 Years',
    minAge: 5,
    maxAge: 5,
    description: 'Targeted school-readiness curriculum preparing children smoothly for Primary 1. Emphasis on early reading, handwriting, numeracy, and cooperative projects.',
    keySubjects: ['Early Reading & Phonics', 'Numeracy & Basic Addition', 'Kinyarwanda & English Foundations', 'Science Discovery', 'Character Building'],
    learningGoals: ['Confident reading of simple sentences', 'Numeracy 1 to 50', 'Preparedness for standard primary desks and timetable'],
    schedule: '7:15 AM – 1:30 PM'
  },
  {
    code: 'P1',
    name: 'Primary 1 (P1)',
    level: 'Primary',
    ageRange: '6 Years',
    minAge: 6,
    maxAge: 6,
    description: 'The gateway to primary education following the Rwanda National Curriculum (REB). Building solid literacy, mathematical logic, and civic awareness.',
    keySubjects: ['English Literacy', 'Mathematics', 'Kinyarwanda', 'Social & Religious Studies', 'Elementary Science & Technology'],
    learningGoals: ['Fluent decoding of reader books', 'Two-digit arithmetic', 'Teamwork and classroom responsibility'],
    schedule: '7:00 AM – 3:30 PM'
  },
  {
    code: 'P2',
    name: 'Primary 2 (P2)',
    level: 'Primary',
    ageRange: '7 Years',
    minAge: 7,
    maxAge: 7,
    description: 'Consolidation of fundamental literacy and numeracy skills with introduction to beginner ICT and expressive creative writing.',
    keySubjects: ['English Reading & Composition', 'Mathematics', 'Kinyarwanda', 'Social Studies', 'Science & Tech Labs', 'Basic Computer Skills'],
    learningGoals: ['Sentence construction and paragraph writing', 'Multiplication concepts', 'Keyboard & computer orientation'],
    schedule: '7:00 AM – 3:30 PM'
  },
  {
    code: 'P3',
    name: 'Primary 3 (P3)',
    level: 'Primary',
    ageRange: '8 Years',
    minAge: 8,
    maxAge: 8,
    description: 'Transition class solidifying English as the primary medium of instruction across all major subject matters, preparing students for upper primary.',
    keySubjects: ['English Advanced Foundations', 'Mathematics', 'Integrated Science', 'Social Studies & Geography', 'Kinyarwanda', 'ICT & Digital Tools'],
    learningGoals: ['Fluency in English academic vocabulary', 'Problem solving with word problems', 'Independent research reading'],
    schedule: '7:00 AM – 4:00 PM'
  },
  {
    code: 'P4',
    name: 'Primary 4 (P4)',
    level: 'Primary',
    ageRange: '9 Years',
    minAge: 9,
    maxAge: 9,
    description: 'Upper primary launch with specialized subject instructors. Deep-dive science experiments, Rwandan geography and history, and interactive computer practice.',
    keySubjects: ['Mathematics', 'Science & Elementary Technology (SET)', 'Social Studies', 'English Language', 'French Introduction', 'Kinyarwanda', 'ICT'],
    learningGoals: ['Analytical thinking and scientific method', 'French language basics', 'Structured group debates'],
    schedule: '7:00 AM – 4:30 PM'
  },
  {
    code: 'P5',
    name: 'Primary 5 (P5)',
    level: 'Primary',
    ageRange: '10 Years',
    minAge: 10,
    maxAge: 10,
    description: 'Rigorous academic preparation fostering critical thinking, national curriculum mastery, leadership responsibilities, and coding/typing proficiency.',
    keySubjects: ['Advanced Mathematics', 'Integrated Science', 'Social Studies & Civics', 'English Composition & Literature', 'French', 'Kinyarwanda', 'ICT'],
    learningGoals: ['High-level problem solving', 'Leadership in school prefect positions', 'Solid exam readiness foundations'],
    schedule: '7:00 AM – 4:30 PM'
  },
  {
    code: 'P6',
    name: 'Primary 6 (P6)',
    level: 'Primary',
    ageRange: '11–12 Years',
    minAge: 11,
    maxAge: 12,
    description: 'Final graduating year preparing pupils for the Rwanda National Primary Leaving Examination (PLE). Dedicated revision camps, mock exams, and secondary placement guidance.',
    keySubjects: ['PLE Mathematics', 'PLE Science & Tech', 'PLE Social Studies', 'PLE English', 'French Enrichment', 'Kinyarwanda', 'ICT Projects'],
    learningGoals: ['Top Division I placement in national examinations', 'Self-directed study discipline', 'Secondary school transition readiness'],
    schedule: '7:00 AM – 5:00 PM (With evening guided prep)'
  }
];

export const DAILY_TIMELINE: TimelineEvent[] = [
  {
    time: '7:00 AM – 7:30 AM',
    title: 'Arrival & Security Check-in',
    category: 'arrival',
    description: 'Safe arrival at our secure campus adjacent to Mugina Police Station. Warm greeting by duty teachers, hand hygiene, and classroom transition.',
    nurseryDetail: 'Personal handoff to nursery caregivers; morning cubby bag drop and free coloring.',
    primaryDetail: 'Assembly inspection, national anthem & pledge of loyalty (Indangagaciro z’umuco), day briefing.'
  },
  {
    time: '7:30 AM – 10:00 AM',
    title: 'Morning Academic Blocks',
    category: 'academic',
    description: 'Peak focus hours dedicated to core cognitive fundamentals: Mathematics, Phonics, English reading, and problem-solving.',
    nurseryDetail: 'Phonics circle, letter tracing, shape matching, and singing games.',
    primaryDetail: 'In-depth Mathematics problem solving followed by English grammar & reading comprehension.'
  },
  {
    time: '10:00 AM – 10:45 AM',
    title: 'Nutritious Snack & Outdoor Play',
    category: 'nutrition',
    description: 'Healthy porridge/milk and fresh fruit snack followed by supervised playground activities on safe grass and sand play areas.',
    nurseryDetail: 'Warm fresh milk/porridge with bananas; sensory playground climbing frames.',
    primaryDetail: 'Snack break and free football, skipping ropes, and social games with peers.'
  },
  {
    time: '10:45 AM – 12:30 PM',
    title: 'Science, Discovery & ICT Laboratory',
    category: 'academic',
    description: 'Hands-on experiential learning where theory meets real-world discovery in our science corners and computer laboratory.',
    nurseryDetail: 'Nature exploration, planting seeds in school vegetable patch, building blocks.',
    primaryDetail: 'Hands-on computer literacy (typing, educational software) and science experiments.'
  },
  {
    time: '12:30 PM – 1:45 PM',
    title: 'Balanced Lunch & Rest Period',
    category: 'nutrition',
    description: 'Wholesome warm lunch prepared on campus in strict hygienic standards (rice, beans, vegetables, potatoes, fresh fruit).',
    nurseryDetail: 'Nutritious lunch followed by a supervised nap in our quiet nursery resting hall.',
    primaryDetail: 'Nutritious lunch, school library quiet reading, chess, or table tennis.'
  },
  {
    time: '1:45 PM – 3:30 PM',
    title: 'Social Studies, Languages & Remedial Support',
    category: 'academic',
    description: 'Deepening knowledge in Kinyarwanda, Rwandan history, civics, and teacher-guided homework assistance.',
    nurseryDetail: 'Storytelling in Kinyarwanda & English with puppet shows and creative roleplay.',
    primaryDetail: 'Social Studies, Kinyarwanda literature, French introduction, and teacher homework clinic.'
  },
  {
    time: '3:30 PM – 4:45 PM',
    title: 'Creative Arts, Traditional Dance & Clubs',
    category: 'arts',
    description: 'Enrichment time: Itorero ry’abato (traditional Rwandan dance & drumming), football, choir, drama, debate, and gardening.',
    nurseryDetail: 'Finger painting, rhythm clapping, clay molding, and dismissal from 4:00 PM.',
    primaryDetail: 'Intore dance practice, competitive inter-house sports, debate club, ICT projects.'
  },
  {
    time: '4:45 PM – 5:00 PM',
    title: 'Safe Dismissal & Parent Handoff',
    category: 'arrival',
    description: 'Orderly dismissal with verified security pickup. School bus departures for Kamonyi routes and extended study hall opening.',
    nurseryDetail: 'Strict guardian badge verification before student release.',
    primaryDetail: 'Personal homework diary sign-off and boarding bus or parent pickup.'
  }
];

export const FACILITIES_LIST: FacilityItem[] = [
  {
    id: 'f1',
    title: 'Brick Classrooms & Landscaped Grounds',
    category: 'classrooms',
    description: 'Purpose-built, naturally ventilated brick classrooms with ergonomic desks, large windows, and scenic views of the lush Kamonyi rolling hills.',
    imageSrc: '/src/assets/images/hero_mugina_hope_campus_1791823254957.jpg',
    caption: 'Modern primary classroom wings surrounded by clean landscaped gardens in Mugina Sector.'
  },
  {
    id: 'f2',
    title: 'Modern ICT & Digital Literacy Laboratory',
    category: 'technology',
    description: 'Equipped with dedicated desktop workstations, high-speed learning software, and interactive educational software aligning with Rwanda’s Smart Classroom vision.',
    imageSrc: '/src/assets/images/primary_stem_computer_lab_1791823280335.jpg',
    caption: 'Pupils developing digital literacy, coding logic, and typing skills with our ICT instructor.'
  },
  {
    id: 'f3',
    title: 'Nursery Childcare & Early Learning Center',
    category: 'classrooms',
    description: 'Specially padded, child-safe nursery hall filled with montessori-style educational toys, bilingual charts, soft mats, and dedicated sleeping cots.',
    imageSrc: '/src/assets/images/nursery_play_learning_1791823267251.jpg',
    caption: 'Joyful, safe early childhood education under the nurturing guidance of certified nursery caregivers.'
  },
  {
    id: 'f4',
    title: 'Cultural Field & Traditional Itorero Ground',
    category: 'culture',
    description: 'Open green recreation grounds where students practice traditional Rwandan drumming, Umushayayo, and Intore dance celebrating our national heritage.',
    imageSrc: '/src/assets/images/campus_life_traditional_dance_1791823290926.jpg',
    caption: 'Pupils performing traditional Rwandan dances in authentic attire during our campus cultural showcase.'
  },
  {
    id: 'f5',
    title: 'Secure School Perimeter & Guarded Gate',
    category: 'outdoor',
    description: 'Located right next to the Mugina Police Station with 24/7 security personnel, perimeter wall, CCTV entrance monitor, and visitor verification logbook.',
    imageSrc: '/src/assets/images/hero_mugina_hope_campus_1791823254957.jpg',
    caption: 'Uncompromising child safety with immediate proximity to the local Mugina Police Post.'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-parent-1',
    type: 'parent',
    author: 'Beatha Mukamana',
    role: 'Parent of P4 & Nursery Top Pupils',
    location: 'Mugina Sector, Kamonyi',
    quote: 'The peace of mind knowing my children are studying right next to the Mugina Police Station is priceless. Moreover, the English fluency, mathematics confidence, and moral discipline my daughter gained within just two terms is remarkable!',
    childGrade: 'Primary 4 & Nursery Top',
    highlight: 'English Fluency & Top Safety Landmark',
    avatarInitials: 'BM',
    rating: 5,
  },
  {
    id: 't-student-1',
    type: 'student',
    author: 'Keza Divine',
    role: 'Primary 6 Candidate & Science Club Leader',
    location: 'Mugina Academy Campus',
    quote: 'Mugina Hope Academy taught me to believe in my potential. Our science teacher lets us conduct real experiments, and using the computer lab helped me prepare confidently for the national Primary Leaving Examinations.',
    childGrade: 'Primary 6 Pupil',
    highlight: 'PLE Candidate & Science Leader',
    avatarInitials: 'KD',
    rating: 5,
  },
  {
    id: 't-parent-2',
    type: 'parent',
    author: 'Emmanuel Nshimiyimana',
    role: 'Parent of P6 Graduate (Class of 2025)',
    location: 'Ruyenzi, Kamonyi',
    quote: 'Mugina Hope Academy prepared my son for national examinations with diligence. He achieved Division I in the PLE national mock trials, and his computer literacy and respectful demeanor make our whole family proud.',
    childGrade: 'Primary 6 Graduate',
    highlight: 'Division I National PLE Mock Success',
    avatarInitials: 'EN',
    rating: 5,
  },
  {
    id: 't-student-2',
    type: 'student',
    author: 'Mugisha David',
    role: 'Primary 5 Learner & Traditional Itorero Dancer',
    location: 'Kamonyi District',
    quote: 'I love coming to school every morning! We learn mathematics and English with friendly teachers, and after class we practice Rwandan cultural dance and football on the pitch. The school feels like a second family.',
    childGrade: 'Primary 5 Pupil',
    highlight: 'Itorero Heritage & Vibrant Campus Life',
    avatarInitials: 'MD',
    rating: 5,
  },
  {
    id: 't-parent-3',
    type: 'parent',
    author: 'Claudine Uwimana',
    role: 'Parent of Baby Class Toddler',
    location: 'Kamonyi District',
    quote: 'Starting school at age 3 can be scary for a mother, but the teachers at Mugina Hope Nursery treat each toddler with tender love. He comes home singing English phonics rhymes, reciting numbers, and smiling.',
    childGrade: 'Baby Class (Nursery)',
    highlight: 'Gentle Early Childhood Development',
    avatarInitials: 'CU',
    rating: 5,
  },
  {
    id: 't-student-3',
    type: 'student',
    author: 'Hirwa Kevin',
    role: 'P6 Alumni & Academic Award Recipient',
    location: 'Southern Province',
    quote: 'The foundation I built at Mugina Hope Academy made joining secondary school so easy. Teachers gave us individual attention, homework guidance, and encouraged us to speak English every single day.',
    childGrade: 'Class of 2024 Alumni',
    highlight: 'Strong Foundation for Secondary School',
    avatarInitials: 'HK',
    rating: 5,
  },
  {
    id: 't-parent-4',
    type: 'parent',
    author: 'Jean-Paul Hakizimana',
    role: 'Parent of P1 & P3 Pupils',
    location: 'Mugina Center',
    quote: 'The direct communication from administration is incredible. We receive attendance reports on Gmail, term feedback promptly, and our children are safe every minute of the day. Mugina Hope is a blessing to our community.',
    childGrade: 'Primary 1 & Primary 3',
    highlight: 'Transparent Communication & Parental Partnership',
    avatarInitials: 'JH',
    rating: 5,
  },
];

export const FAQS: FAQItem[] = [
  {
    question: 'Where is Mugina Hope Primary & Nursery Academy located?',
    answer: 'We are situated in Mugina Sector, Kamonyi District, Southern Province, Rwanda. A prominent safety landmark is our immediate proximity right adjacent to the local Mugina Police Station, offering 24/7 peace of mind for parents.',
    category: 'security'
  },
  {
    question: 'What curriculum does Mugina Hope Academy teach?',
    answer: 'We follow the official Rwanda Basic Education Board (REB) National Curriculum Standards, taught with English as the primary medium of instruction, supplemented with intensive French, Kinyarwanda cultural heritage, and modern ICT computer literacy.',
    category: 'academics'
  },
  {
    question: 'How do I know which class my child should enroll in?',
    answer: 'We have an interactive Age Calculator on our website! In general: Baby Class is for 3-year-olds; Middle Class is for 4-year-olds; Pre-Primary is for 5-year-olds; and Primary 1 begins at age 6 up through Primary 6 (ages 11-12).',
    category: 'admissions'
  },
  {
    question: 'What documents are required for registration?',
    answer: 'Parents must provide: (1) A copy of the child’s official Birth Certificate (Icyemezo cy’amavuko), (2) Two recent passport-size photos, (3) Previous school report card/records (for Primary transfers), and (4) A copy of the parent/guardian’s National ID or Passport.',
    category: 'admissions'
  },
  {
    question: 'Do you offer school meals and transportation?',
    answer: 'Yes! We provide an optional daily hot nutritious lunch program (prepared fresh on campus) as well as secure school van pick-up and drop-off covering Mugina Center, Kamonyi hubs, and nearby residential zones.',
    category: 'fees'
  },
  {
    question: 'How secure is the campus during the day?',
    answer: 'Safety is our highest institutional priority. In addition to being situated next to the Mugina Police Station, our campus features a fully enclosed perimeter wall, 24/7 security guards at the gates, visitor ID logging, and strict authorized-parent-only dismissal protocols.',
    category: 'security'
  }
];

export const TUITION_STRUCTURE = {
  currency: 'RWF',
  termsPerYear: 3,
  levels: [
    {
      level: 'Nursery (Baby, Middle, Pre-Primary)',
      tuitionPerTerm: 85000,
      materialsFee: 15000,
      description: 'Includes classroom learning supplies, phonics workbooks, early learning toys and play resources.'
    },
    {
      level: 'Lower Primary (P1, P2, P3)',
      tuitionPerTerm: 110000,
      materialsFee: 20000,
      description: 'Includes textbooks, exercise books, basic ICT lab access, and physical education equipment.'
    },
    {
      level: 'Upper Primary (P4, P5, P6)',
      tuitionPerTerm: 135000,
      materialsFee: 25000,
      description: 'Includes full science lab practicals, ICT lab workstation time, library access, and PLE examination preparations.'
    }
  ],
  optionalAddons: [
    { id: 'lunch', name: 'Nutritious Hot Lunch Program', feePerTerm: 45000, description: 'Fresh, balanced hot lunch daily + mid-morning milk/porridge and fruit' },
    { id: 'transport_local', name: 'School Bus (Mugina Zone)', feePerTerm: 50000, description: 'Safe morning pick-up and afternoon home drop-off within 5km radius' },
    { id: 'transport_extended', name: 'School Bus (Kamonyi Extended Zone)', feePerTerm: 70000, description: 'Safe transport covering extended Kamonyi routes and pickup hubs' },
    { id: 'uniform_pack', name: 'Official School Uniform Pack (One-time)', feePerTerm: 35000, description: '2 complete sets of school uniforms, 1 sports PE kit, 1 school sweater' }
  ]
};
