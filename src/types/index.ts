export type PageId = 'home' | 'about' | 'academics' | 'admissions' | 'campus-life' | 'contact' | 'admin';

export interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  category: 'arrival' | 'academic' | 'nutrition' | 'play' | 'arts';
  nurseryDetail?: string;
  primaryDetail?: string;
}

export interface AcademicGrade {
  code: string;
  name: string;
  level: 'Nursery' | 'Primary';
  ageRange: string;
  minAge: number;
  maxAge: number;
  description: string;
  keySubjects: string[];
  learningGoals: string[];
  schedule: string;
}

export interface FacilityItem {
  id: string;
  title: string;
  category: 'classrooms' | 'sports' | 'technology' | 'culture' | 'outdoor';
  description: string;
  imageSrc: string;
  caption: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  location: string;
  quote: string;
  childGrade: string;
  type?: 'parent' | 'student';
  highlight?: string;
  avatarInitials?: string;
  rating?: number;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: 'admissions' | 'academics' | 'security' | 'fees';
}
