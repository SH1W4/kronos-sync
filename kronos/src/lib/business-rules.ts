export const BUSINESS_RULES = {
  MINIMUM_BOOKING_VALUE: 400,
  GUEST_COMMISSION_RATE: 0.30,
  RESIDENT_INITIAL_COMMISSION_RATE: 0.30,
  RESIDENT_REDUCED_COMMISSION_RATE: 0.20,
  RESIDENT_COMMISSION_THRESHOLD: 10000,
  DEFAULT_MARKUP: 0.20,
  SLOT_HOLD_TIMEOUT: 5 * 60 * 1000, // 5 minutes in milliseconds
}

export function calculateCommission(
  artistPlan: 'GUEST' | 'RESIDENT',
  monthlyEarnings: number
): number {
  if (artistPlan === 'GUEST') {
    return BUSINESS_RULES.GUEST_COMMISSION_RATE
  }
  
  if (monthlyEarnings >= BUSINESS_RULES.RESIDENT_COMMISSION_THRESHOLD) {
    return BUSINESS_RULES.RESIDENT_REDUCED_COMMISSION_RATE
  }
  
  return BUSINESS_RULES.RESIDENT_INITIAL_COMMISSION_RATE
}

export function calculateBookingSplit(
  value: number,
  discountValue: number,
  commissionRate: number
) {
  const finalValue = value - discountValue
  const artistShare = finalValue * (1 - commissionRate)
  const studioShare = finalValue * commissionRate
  
  return {
    finalValue,
    artistShare,
    studioShare
  }
}

export function calculateProductPrice(basePrice: number, markup: number): number {
  return basePrice * (1 + markup)
}

export function applyCoupon(
  value: number,
  couponType: 'PERCENT' | 'FIXED',
  couponValue: number
): number {
  if (couponType === 'PERCENT') {
    return value * (couponValue / 100)
  }
  return Math.min(couponValue, value)
}

