import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { COOKIE_NAME, verifySessionToken } from '@/lib/admin-auth';

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  return !!session;
}

async function readSectionSafe(section: string) {
  try {
    const filePath = path.join(
      process.cwd(),
      'app',
      'config',
      'sections',
      `${section}.json`
    );
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [
    gamesData,
    vpsData,
    dedicatedData,
    webhostingData,
    discordData,
    pricingData,
    navigationData,
    uiData,
    heroData,
  ] = await Promise.all([
    readSectionSafe('games'),
    readSectionSafe('vps'),
    readSectionSafe('dedicated'),
    readSectionSafe('webhosting'),
    readSectionSafe('discord'),
    readSectionSafe('pricing'),
    readSectionSafe('navigation'),
    readSectionSafe('ui'),
    readSectionSafe('hero'),
  ]);

  // Count games
  const totalGames = gamesData?.games?.length || 0;
  const featuredGames = gamesData?.games?.filter((g: any) => g.featured)?.length || 0;

  // Count VPS plans across all cpu types
  let totalVpsPlans = 0;
  if (vpsData?.plans) {
    Object.values(vpsData.plans).forEach((planList: any) => {
      if (Array.isArray(planList)) {
        totalVpsPlans += planList.length;
      }
    });
  }

  // Count Dedicated plans
  let totalDedicatedPlans = 0;
  if (dedicatedData?.plans) {
    Object.values(dedicatedData.plans).forEach((planList: any) => {
      if (Array.isArray(planList)) {
        totalDedicatedPlans += planList.length;
      }
    });
  }

  // Count Webhosting plans
  let totalWebhostingPlans = 0;
  if (webhostingData?.plans) {
    Object.values(webhostingData.plans).forEach((planList: any) => {
      if (Array.isArray(planList)) {
        totalWebhostingPlans += planList.length;
      }
    });
  }

  // Count Discord bot hosting plans
  let totalDiscordPlans = 0;
  if (discordData?.plans) {
    Object.values(discordData.plans).forEach((planList: any) => {
      if (Array.isArray(planList)) {
        totalDiscordPlans += planList.length;
      }
    });
  }

  // Count pricing tiers on homepage
  const totalPricingTiers = pricingData?.section?.plans?.length || 0;

  // Currencies count
  const totalCurrencies = uiData?.currency?.supportedCurrencies?.length || 0;

  // Announcement banner
  const bannerActive = !!navigationData?.banner?.show;
  const bannerText = navigationData?.banner?.text || '';
  const couponCode = navigationData?.banner?.couponCode || '';

  // Brand Name
  const brandName = heroData?.navbar?.brandName || 'Dezer';
  const brandAccent = heroData?.navbar?.brandAccent || 'Host';

  return NextResponse.json({
    success: true,
    stats: {
      totalGames,
      featuredGames,
      totalVpsPlans,
      totalDedicatedPlans,
      totalWebhostingPlans,
      totalDiscordPlans,
      totalPricingTiers,
      totalCurrencies,
      bannerActive,
      bannerText,
      couponCode,
      brandName,
      brandAccent,
      snowfallEnabled: !!uiData?.christmasTheme?.enabled,
      loadingScreenEnabled: !!uiData?.loading?.enableLoadingScreen,
    },
  });
}

