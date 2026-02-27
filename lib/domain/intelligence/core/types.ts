/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  INTELLIGENCE CORE TYPES — Tipos base compartilhados           ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Fundação para todos os engines de inteligência.               ║
 * ║  Zero dependências externas. Pure TypeScript.                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// Score range types
export type Score0to100 = number;       // 0-100
export type Confidence = number;         // 0-1
export type Percentage = number;         // 0-100
export type TrendDelta = number;         // -100 to +100

// Trend direction
export type TrendDirection = 'rising' | 'stable' | 'declining';

// Engagement tier
export type EngagementTier = 'champion' | 'committed' | 'active' | 'drifting' | 'disconnected';

// Attention priority
export type AttentionLevel = 1 | 2 | 3 | 4 | 5; // 1=urgent, 5=autonomous

// Community role
export type CommunityRole = 'connector' | 'loyalist' | 'solo' | 'influencer' | 'newcomer';

// Dropoff pattern
export type DropoffPattern = 'gradual' | 'abrupt' | 'seasonal' | 'event_driven' | 'unknown';

// Learning style
export type LearningStyle = 'consistent_grinder' | 'intensity_burst' | 'social_learner' | 'goal_oriented' | 'explorer' | 'routine_follower';

// Learning speed
export type LearningSpeed = 'slow' | 'average' | 'fast';

// Motivation drivers
export type MotivationDriver = 'ranking' | 'badges' | 'promotion' | 'social' | 'streak' | 'competition' | 'mastery' | 'health';

// Preferred time
export type TimeSlot = 'morning' | 'afternoon' | 'evening';

// Priority levels
export type Priority = 'critical' | 'high' | 'medium' | 'low';

// Alert type
export type AlertSeverity = 'info' | 'warning' | 'danger';

// Base metadata for all engine outputs
export interface IntelligenceMetadata {
  computedAt: string;        // ISO timestamp
  confidence: Confidence;
  dataPoints: number;
  firstEventAt?: string;     // Since when we have data
}

// Data quality info
export interface DataQualityInfo {
  availableFactors: number;
  totalFactors: number;
  completeness: Confidence;  // 0-1
  oldestDataPoint?: string;
}

// Trend indicator (reusable)
export interface TrendIndicator {
  level: 'excellent' | 'good' | 'developing' | 'needs_attention';
  trend: TrendDirection;
  description: string;
}

// Spotlight context types (for instructor coach)
export type SpotlightContextType =
  | 'returning_after_absence'
  | 'near_promotion'
  | 'declining_engagement'
  | 'new_student'
  | 'achieved_milestone'
  | 'struggling_with'
  | 'champion_potential';

// Question types for adaptive tests
export type QuestionType =
  | 'practical_demonstration'
  | 'situational'
  | 'sequence'
  | 'identification'
  | 'application'
  | 'self_assessment';

// Class recommendation types
export type ClassRecommendationType =
  | 'split_class'
  | 'merge_class'
  | 'change_time'
  | 'focus_retention'
  | 'pair_mentoring'
  | 'adjust_difficulty'
  | 'celebrate_progress'
  | 'welcome_back'
  | 'pre_promotion_focus';
