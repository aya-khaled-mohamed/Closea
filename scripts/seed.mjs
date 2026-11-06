import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Closéa Database Seeding...');

  // Clean existing data in reverse order of foreign keys
  await prisma.adminActivityLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.dressProcessingRecord.deleteMany();
  await prisma.atelierAssignment.deleteMany();
  await prisma.atelier.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.dressAvailability.deleteMany();
  await prisma.dressImage.deleteMany();
  await prisma.dress.deleteMany();
  await prisma.size.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.commissionSetting.deleteMany();
  await prisma.platformSetting.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash('Closea2026!', salt);
  const adminPasswordHash = await bcrypt.hash('CloseaAdmin2026!', salt);

  // 1. Commission Settings
  await prisma.commissionSetting.create({
    data: {
      key: 'DEFAULT',
      platformFeePercent: 15.0,
      atelierFeePercent: 10.0,
      ownerSharePercent: 75.0,
      isActive: true,
    },
  });

  // 2. Platform Settings
  await prisma.platformSetting.createMany({
    data: [
      { key: 'BANNER_ANNOUNCEMENT', value: 'Complimentary Atelier fitting and eco-cleaning included on all weekend bookings.', description: 'Top announcement ticker' },
      { key: 'MIN_RENTAL_DAYS', value: '2', description: 'Minimum rental duration' },
      { key: 'CURRENCY', value: 'EGP', description: 'Platform primary currency' },
      { key: 'SUPPORT_EMAIL', value: 'concierge@closea.com', description: 'Customer concierge contact' },
    ],
  });

  // 3. Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@closea.com',
      passwordHash: adminPasswordHash,
      name: 'Geneviève Moreau',
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '+33 1 42 68 55 00',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      profile: {
        create: {
          bio: 'Head of Operations & Platform Governance at Closéa.',
          location: 'Qena, France',
          idVerified: true,
        },
      },
    },
  });

  // 4. Atelier Users & Profiles
  const atelierUser1 = await prisma.user.create({
    data: {
      email: 'contact@atelier-sainthonore.com',
      passwordHash: commonPasswordHash,
      name: 'Marcelle Dubois',
      role: 'ATELIER',
      status: 'ACTIVE',
      phone: '+33 1 40 20 18 19',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    },
  });

  const atelier1 = await prisma.atelier.create({
    data: {
      userId: atelierUser1.id,
      name: 'Atelier Saint-Honoré Couture',
      slug: 'atelier-saint-honore',
      contactPerson: 'Marcelle Dubois',
      email: 'contact@atelier-sainthonore.com',
      phone: '+33 1 40 20 18 19',
      address: 'oré',
      city: 'Qena',
      postalCode: '75008',
      isActive: true,
    },
  });

  const atelierUser2 = await prisma.user.create({
    data: {
      email: 'contact@retouche-marais.com',
      passwordHash: commonPasswordHash,
      name: 'Antoine Lefebvre',
      role: 'ATELIER',
      status: 'ACTIVE',
      phone: '+33 1 42 77 90 12',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
  });

  const atelier2 = await prisma.atelier.create({
    data: {
      userId: atelierUser2.id,
      name: 'Maison de Retouche Marais',
      slug: 'retouche-marais',
      contactPerson: 'Antoine Lefebvre',
      email: 'contact@retouche-marais.com',
      phone: '+33 1 42 77 90 12',
      address: '14 Rue des Rosiers',
      city: 'Qena',
      postalCode: '75004',
      isActive: true,
    },
  });

  // 5. Dress Owners
  const ownerSophie = await prisma.user.create({
    data: {
      email: 'sophie.laurent@closea.com',
      passwordHash: commonPasswordHash,
      name: 'Sophie Laurent',
      role: 'OWNER',
      status: 'ACTIVE',
      phone: '+33 6 12 34 56 78',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      profile: {
        create: {
          bio: 'Curator of vintage couture and modern runway silhouettes. Passionate about circular luxury.',
          location: 'Qena, 7e',
          preferredSize: 'S (FR 36)',
          idVerified: true,
          payoutBankName: 'BNP Paribas',
          payoutAccountNumber: 'FR76 3000 4012 3456 7890 1234 567',
        },
      },
    },
  });

  const ownerElena = await prisma.user.create({
    data: {
      email: 'elena.vance@closea.com',
      passwordHash: commonPasswordHash,
      name: 'Elena Vance',
      role: 'OWNER',
      status: 'ACTIVE',
      phone: '+33 6 98 76 54 32',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      profile: {
        create: {
          bio: 'Fashion stylist with an archive of red-carpet gowns and bespoke cocktail dresses.',
          location: 'Neuilly-sur-Seine',
          preferredSize: 'M (FR 38)',
          idVerified: true,
          payoutBankName: 'Société Générale',
          payoutAccountNumber: 'FR76 3000 3045 6789 0123 4567 890',
        },
      },
    },
  });

  // 6. Customers
  const customerCamille = await prisma.user.create({
    data: {
      email: 'camille.dupont@closea.com',
      passwordHash: commonPasswordHash,
      name: 'Camille Dupont',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      phone: '+33 6 45 67 89 01',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      profile: {
        create: {
          bio: 'Attending gala evenings and opera premieres in Qena.',
          location: 'Qena, 16e',
          preferredSize: 'S (FR 36)',
          idVerified: true,
        },
      },
    },
  });

  const customerIsabella = await prisma.user.create({
    data: {
      email: 'isabella.rossi@closea.com',
      passwordHash: commonPasswordHash,
      name: 'Isabella Rossi',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      phone: '+33 6 88 12 34 56',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      profile: {
        create: {
          bio: 'Lover of Italian silk and architectural tailoring.',
          location: 'Qena, 8e',
          preferredSize: 'M (FR 38)',
          idVerified: true,
        },
      },
    },
  });

  // 7. Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Gala & Black Tie',
        slug: 'gala-black-tie',
        description: 'Floor-length gowns, dramatic silhouettes, and red carpet ready statements.',
        imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
        displayOrder: 1,
        isFeatured: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Cocktail & Evening',
        slug: 'cocktail-evening',
        description: 'Refined midi cuts, sculptural bodices, and sophisticated evening glamour.',
        imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
        displayOrder: 2,
        isFeatured: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Bridal & Rehearsal',
        slug: 'bridal-rehearsal',
        description: 'Ivory silks, romantic lace, and modern wedding guest or rehearsal attire.',
        imageUrl: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80',
        displayOrder: 3,
        isFeatured: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Summer Soirée & Garden',
        slug: 'summer-soiree-garden',
        description: 'Breezy organza, delicate florals, and sun-drenched terrace ensembles.',
        imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
        displayOrder: 4,
        isFeatured: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Editorial & Runway',
        slug: 'editorial-runway',
        description: 'Avant-garde runway masterpieces and archive fashion week pieces.',
        imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
        displayOrder: 5,
        isFeatured: false,
      },
    }),
  ]);

  // 8. Sizes
  const sizes = await Promise.all([
    prisma.size.create({ data: { label: 'XS (FR 34)', description: 'Bust 80-82cm, Waist 60-62cm', sortOrder: 1 } }),
    prisma.size.create({ data: { label: 'S (FR 36)', description: 'Bust 84-86cm, Waist 64-66cm', sortOrder: 2 } }),
    prisma.size.create({ data: { label: 'M (FR 38)', description: 'Bust 88-90cm, Waist 68-70cm', sortOrder: 3 } }),
    prisma.size.create({ data: { label: 'L (FR 40)', description: 'Bust 92-94cm, Waist 72-74cm', sortOrder: 4 } }),
    prisma.size.create({ data: { label: 'XL (FR 42)', description: 'Bust 96-98cm, Waist 76-78cm', sortOrder: 5 } }),
  ]);

  const [catGala, catCocktail, catBridal, catSummer, catEditorial] = categories;
  const [sizeXS, sizeS, sizeM, sizeL, sizeXL] = sizes;

  // 9. Dresses
  const dressData = [
    {
      title: 'Aurelia Silk Chiffon Draped Column Gown',
      slug: 'aurelia-silk-chiffon-column-gown',
      description: 'Masterfully crafted from heavyweight mulberry silk chiffon in a delicate blush nude tone. Features an asymmetric draped neckline, internal boned corset, and an ethereal trailing hem that floats with every step. Perfect for black tie galas and opera evenings.',
      ownerId: ownerSophie.id,
      categoryId: catGala.id,
      sizeId: sizeS.id,
      color: 'Soft Blush',
      brand: 'Jacquemus Atelier',
      condition: 'Pristine',
      originalPrice: 1950.0,
      rentalPricePerDay: 85.0,
      cleaningFee: 30.0,
      securityDeposit: 150.0,
      location: 'Qena, 7e (Saint-Germain)',
      rentalTerms: 'Dry clean exclusively handled by partner atelier. No perfume sprayed directly on silk.',
      status: 'APPROVED',
      isFeatured: true,
      viewsCount: 342,
      images: [
        { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80', isPrimary: false, displayOrder: 2 },
      ],
    },
    {
      title: 'Celeste Pleated Rose Gold Evening Dress',
      slug: 'celeste-pleated-rose-gold-dress',
      description: 'Sunburst pleated metallic rose crepe with micro-crystal accents along the sculpted bodice. A show-stopping dress engineered to catch light from every angle without ever feeling overbearing.',
      ownerId: ownerElena.id,
      categoryId: catCocktail.id,
      sizeId: sizeM.id,
      color: 'Dusty Rose',
      brand: 'Zimmermann',
      condition: 'Excellent',
      originalPrice: 1680.0,
      rentalPricePerDay: 75.0,
      cleaningFee: 25.0,
      securityDeposit: 120.0,
      location: 'Qena, 8e (Champs-Élysées)',
      rentalTerms: 'Handle with care around sharp jewelry.',
      status: 'APPROVED',
      isFeatured: true,
      viewsCount: 289,
      images: [
        { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80', isPrimary: false, displayOrder: 2 },
      ],
    },
    {
      title: 'Elysian Minimalist Silk Slip Dress',
      slug: 'elysian-minimalist-silk-slip',
      description: 'The definitive 90s slip dress re-imagined with modern couture precision. Bias cut in 30mm double-faced silk crepe with delicate spaghetti straps and a low cowl back.',
      ownerId: ownerSophie.id,
      categoryId: catSummer.id,
      sizeId: sizeXS.id,
      color: 'Nude Pink',
      brand: 'Khaite',
      condition: 'Pristine',
      originalPrice: 1250.0,
      rentalPricePerDay: 60.0,
      cleaningFee: 25.0,
      securityDeposit: 100.0,
      location: 'Qena, 6e (Odéon)',
      rentalTerms: 'Steaming only. Complimentary atelier steaming provided before pickup.',
      status: 'APPROVED',
      isFeatured: true,
      viewsCount: 412,
      images: [
        { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80', isPrimary: true, displayOrder: 1 },
      ],
    },
    {
      title: 'Seraphina Sculpted Ivory Bridal & Rehearsal Gown',
      slug: 'seraphina-sculpted-ivory-gown',
      description: 'An architectural column gown crafted in heavy ivory matte crepe with structured shoulder pads, an hourglass waist, and clean covered buttons trailing down the back.',
      ownerId: ownerElena.id,
      categoryId: catBridal.id,
      sizeId: sizeS.id,
      color: 'Pure White',
      brand: 'Safiyaa',
      condition: 'Pristine',
      originalPrice: 2200.0,
      rentalPricePerDay: 95.0,
      cleaningFee: 35.0,
      securityDeposit: 200.0,
      location: 'Neuilly-sur-Seine',
      rentalTerms: 'Specialist bridal dry cleaning included through Atelier Saint-Honoré.',
      status: 'APPROVED',
      isFeatured: true,
      viewsCount: 198,
      images: [
        { url: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1000&q=80', isPrimary: true, displayOrder: 1 },
      ],
    },
    {
      title: 'Verona Sage Green Tiered Organza Gown',
      slug: 'verona-sage-green-tiered-organza-gown',
      description: 'Dreamlike layers of sage green silk organza with a delicate square neckline and romantic ruched bodice. Floats weightlessly and looks breathtaking in natural garden light.',
      ownerId: ownerSophie.id,
      categoryId: catSummer.id,
      sizeId: sizeM.id,
      color: 'Soft Sage Green',
      brand: 'Cecilie Bahnsen',
      condition: 'Excellent',
      originalPrice: 1850.0,
      rentalPricePerDay: 80.0,
      cleaningFee: 30.0,
      securityDeposit: 150.0,
      location: 'Qena, 7e',
      rentalTerms: 'Do not iron directly; use silk steaming only.',
      status: 'APPROVED',
      isFeatured: true,
      viewsCount: 225,
      images: [
        { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80', isPrimary: true, displayOrder: 1 },
      ],
    },
    {
      title: 'Nocturne Deep Olive Velvet Corset Gown',
      slug: 'nocturne-deep-olive-velvet-gown',
      description: 'Sumptuous deep olive silk velvet featuring an internal boned Victorian-style bodice and high side slit. Pure drama and old-world elegance.',
      ownerId: ownerElena.id,
      categoryId: catGala.id,
      sizeId: sizeL.id,
      color: 'Deep Olive',
      brand: 'Vivienne Westwood',
      condition: 'Excellent',
      originalPrice: 2400.0,
      rentalPricePerDay: 110.0,
      cleaningFee: 35.0,
      securityDeposit: 200.0,
      location: 'Qena, 8e',
      rentalTerms: 'Velvet must be brushed in nap direction only.',
      status: 'APPROVED',
      isFeatured: false,
      viewsCount: 178,
      images: [
        { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80', isPrimary: true, displayOrder: 1 },
      ],
    },
    {
      title: 'Mirabelle Dusty Rose Asymmetric Cocktail Dress',
      slug: 'mirabelle-dusty-rose-cocktail-dress',
      description: 'One-shoulder tailored cocktail dress in heavy dusty rose crepe featuring a sculpted capelet sleeve and clean pencil silhouette.',
      ownerId: ownerSophie.id,
      categoryId: catCocktail.id,
      sizeId: sizeS.id,
      color: 'Dusty Rose',
      brand: 'Roland Mouret',
      condition: 'Like New',
      originalPrice: 1450.0,
      rentalPricePerDay: 68.0,
      cleaningFee: 25.0,
      securityDeposit: 120.0,
      location: 'Qena, 6e',
      rentalTerms: 'Strict no-smoking environment.',
      status: 'PENDING_APPROVAL', // Real listing ready for admin approval demonstration!
      isFeatured: false,
      viewsCount: 45,
      images: [
        { url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80', isPrimary: true, displayOrder: 1 },
      ],
    },
    {
      title: 'Ophelia Runway Tulle & Crystal Embellished Gown',
      slug: 'ophelia-runway-tulle-crystal-gown',
      description: 'Hand-embroidered Swarovski crystals over layers of soft champagne tulle. Worn once during Qena Haute Couture Fashion Week.',
      ownerId: ownerElena.id,
      categoryId: catEditorial.id,
      sizeId: sizeS.id,
      color: 'Soft Blush',
      brand: 'Elie Saab Haute Couture',
      condition: 'Museum Grade',
      originalPrice: 8500.0,
      rentalPricePerDay: 280.0,
      cleaningFee: 60.0,
      securityDeposit: 500.0,
      location: 'Qena, 8e',
      rentalTerms: 'Requires identity verification and specialized atelier handover.',
      status: 'PENDING_APPROVAL', // Another listing waiting for admin!
      isFeatured: false,
      viewsCount: 88,
      images: [
        { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80', isPrimary: true, displayOrder: 1 },
      ],
    },
    {
      title: 'Fast Fashion Synthetic Glitter Wrap Dress',
      slug: 'synthetic-glitter-wrap-dress',
      description: 'Unbranded polyester wrap dress with loose sequins.',
      ownerId: ownerSophie.id,
      categoryId: catCocktail.id,
      sizeId: sizeM.id,
      color: 'Dark Warm Grey',
      brand: 'Fast-Fashion Unverified',
      condition: 'Fair',
      originalPrice: 45.0,
      rentalPricePerDay: 15.0,
      cleaningFee: 15.0,
      securityDeposit: 30.0,
      location: 'Qena, 10e',
      rentalTerms: 'None',
      status: 'REJECTED',
      rejectionReason: 'Does not meet Closéa designer curation standards. Synthetic fabric with active shedding.',
      isFeatured: false,
      viewsCount: 12,
      images: [
        { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80', isPrimary: true, displayOrder: 1 },
      ],
    },
  ];

  const createdDresses = [];
  for (const d of dressData) {
    const { images, ...data } = d;
    const dress = await prisma.dress.create({
      data: {
        ...data,
        images: {
          create: images,
        },
      },
    });
    createdDresses.push(dress);
  }

  // 10. Wishlist entries
  await prisma.wishlist.create({
    data: {
      userId: customerCamille.id,
      dressId: createdDresses[0].id,
    },
  });
  await prisma.wishlist.create({
    data: {
      userId: customerCamille.id,
      dressId: createdDresses[1].id,
    },
  });
  await prisma.wishlist.create({
    data: {
      userId: customerIsabella.id,
      dressId: createdDresses[0].id,
    },
  });

  // 11. Bookings & Atelier Assignments
  // Booking 1: Confirmed and assigned to Atelier Saint-Honoré
  const booking1 = await prisma.booking.create({
    data: {
      bookingReference: 'CLS-2026-8941',
      dressId: createdDresses[0].id,
      customerId: customerCamille.id,
      startDate: new Date('2026-11-15T10:00:00Z'),
      endDate: new Date('2026-11-18T18:00:00Z'),
      totalDays: 3,
      dailyRate: 85.0,
      rentalSubtotal: 255.0,
      cleaningFee: 30.0,
      securityDeposit: 150.0,
      platformFee: 38.25, // 15%
      atelierFee: 25.50,  // 10%
      ownerPayout: 191.25, // 75%
      totalAmount: 435.0, // 255 + 30 + 150
      status: 'CONFIRMED',
      selectedAtelierId: atelier1.id,
      deliveryAddress: '24 Avenue Montaigne, 75008 Qena',
      specialRequests: 'Please confirm dress hem has been inspected for 10cm heels.',
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Customer submitted rental request', changedByUserId: customerCamille.id },
          { status: 'ACCEPTED', note: 'Owner Sophie accepted rental request', changedByUserId: ownerSophie.id },
          { status: 'CONFIRMED', note: 'Payment pre-authorized and dates blocked', changedByUserId: customerCamille.id },
        ],
      },
      transactions: {
        create: [
          {
            type: 'BOOKING_PAYMENT',
            amount: 435.0,
            status: 'SUCCESS',
            paymentMethod: 'STRIPE_CARD_EMULATED',
            reference: 'tx_pay_8941_a83f9',
            gatewayNote: 'Rental subtotal EGP255 + Cleaning EGP30 + Deposit EGP150 hold',
          },
        ],
      },
    },
  });

  // Atelier assignment for Booking 1
  const assignment1 = await prisma.atelierAssignment.create({
    data: {
      atelierId: atelier1.id,
      bookingId: booking1.id,
      dressId: createdDresses[0].id,
      operationalStatus: 'RECEIVED',
      notes: 'Dress received from owner Sophie. Initial inspection showed pristine silk. Proceeding to steam and eco-refresh.',
      receivedAt: new Date('2026-11-06T09:30:00Z'),
      processingRecords: {
        create: [
          { stage: 'AWAITING_DELIVERY', description: 'Logistics courier dispatched to owner address.', performedBy: 'System' },
          { stage: 'RECEIVED', description: 'Package unboxed and verified against garment checklist. Condition pristine.', performedBy: 'Marcelle Dubois' },
        ],
      },
    },
  });

  // Booking 2: Active rental in progress
  const booking2 = await prisma.booking.create({
    data: {
      bookingReference: 'CLS-2026-7210',
      dressId: createdDresses[1].id,
      customerId: customerIsabella.id,
      startDate: new Date('2026-11-04T10:00:00Z'),
      endDate: new Date('2026-11-08T18:00:00Z'),
      totalDays: 4,
      dailyRate: 75.0,
      rentalSubtotal: 300.0,
      cleaningFee: 25.0,
      securityDeposit: 120.0,
      platformFee: 45.0,
      atelierFee: 30.0,
      ownerPayout: 225.0,
      totalAmount: 445.0,
      status: 'ACTIVE_RENTAL',
      selectedAtelierId: atelier2.id,
      deliveryAddress: 'Atelier pickup at Rue des Rosiers',
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Booking requested', changedByUserId: customerIsabella.id },
          { status: 'CONFIRMED', note: 'Booking confirmed', changedByUserId: ownerElena.id },
          { status: 'READY_FOR_COLLECTION', note: 'Garment prepared and inspected at atelier', changedByUserId: atelierUser2.id },
          { status: 'ACTIVE_RENTAL', note: 'Garment collected by client Isabella Rossi', changedByUserId: atelierUser2.id },
        ],
      },
      transactions: {
        create: [
          {
            type: 'BOOKING_PAYMENT',
            amount: 445.0,
            status: 'SUCCESS',
            paymentMethod: 'STRIPE_CARD_EMULATED',
            reference: 'tx_pay_7210_b91k2',
            gatewayNote: 'Pre-authorized card transaction',
          },
        ],
      },
    },
  });

  // Atelier assignment for Booking 2
  await prisma.atelierAssignment.create({
    data: {
      atelierId: atelier2.id,
      bookingId: booking2.id,
      dressId: createdDresses[1].id,
      operationalStatus: 'COLLECTED',
      notes: 'Customer tried on dress at atelier fitting lounge. Fit verified. Handover completed.',
      receivedAt: new Date('2026-11-02T14:00:00Z'),
      readyAt: new Date('2026-11-03T16:00:00Z'),
      collectedAt: new Date('2026-11-04T11:15:00Z'),
      processingRecords: {
        create: [
          { stage: 'RECEIVED', description: 'Dress received from owner Elena Vance.', performedBy: 'Antoine Lefebvre' },
          { stage: 'CLEANING', description: 'Delicate steam & fabric conditioning.', performedBy: 'Antoine Lefebvre' },
          { stage: 'READY', description: 'Hung in garment bag with Closéa silk ribbons.', performedBy: 'Antoine Lefebvre' },
          { stage: 'COLLECTED', description: 'Client confirmed receipt and fit.', performedBy: 'Antoine Lefebvre' },
        ],
      },
    },
  });

  // Booking 3: Pending owner approval (Interactive demo for Owner dashboard)
  const booking3 = await prisma.booking.create({
    data: {
      bookingReference: 'CLS-2026-9504',
      dressId: createdDresses[2].id,
      customerId: customerCamille.id,
      startDate: new Date('2026-11-20T10:00:00Z'),
      endDate: new Date('2026-11-23T18:00:00Z'),
      totalDays: 3,
      dailyRate: 60.0,
      rentalSubtotal: 180.0,
      cleaningFee: 25.0,
      securityDeposit: 100.0,
      platformFee: 27.0,
      atelierFee: 18.0,
      ownerPayout: 135.0,
      totalAmount: 305.0,
      status: 'PENDING',
      selectedAtelierId: atelier1.id,
      specialRequests: 'Attending an anniversary dinner. Requesting earliest Friday morning dispatch.',
      statusHistory: {
        create: [
          { status: 'PENDING', note: 'Customer submitted rental request', changedByUserId: customerCamille.id },
        ],
      },
    },
  });

  // 12. Reviews
  await prisma.review.create({
    data: {
      bookingId: booking2.id,
      dressId: createdDresses[1].id,
      authorId: customerIsabella.id,
      rating: 5,
      comment: 'The Zimmermann dress exceeded every expectation. The fit was impeccable thanks to Atelier Marais, and the rose gold caught the evening chandeliers effortlessly. I will never buy a single-use gala dress again!',
    },
  });

  // 13. Admin Activity Log records
  await prisma.adminActivityLog.createMany({
    data: [
      {
        adminId: adminUser.id,
        action: 'APPROVE_LISTING',
        targetType: 'DRESS',
        targetId: createdDresses[0].id,
        details: 'Approved Jacquemus Aurelia Column Gown after verifying atelier standards.',
      },
      {
        adminId: adminUser.id,
        action: 'REJECT_LISTING',
        targetType: 'DRESS',
        targetId: createdDresses[8].id,
        details: 'Rejected unbranded synthetic dress for failing quality guidelines.',
      },
      {
        adminId: adminUser.id,
        action: 'UPDATE_COMMISSION',
        targetType: 'SETTING',
        targetId: 'DEFAULT',
        details: 'Initialized platform commission tier: Platform 15%, Atelier 10%, Owner 75%.',
      },
    ],
  });

  // 14. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: ownerSophie.id,
        title: 'New Rental Request #CLS-2026-9504',
        message: 'Camille Dupont has requested to rent your Khaite Elysian Slip Dress for Nov 20 - Nov 23.',
        link: '/dashboard/owner',
        type: 'BOOKING_REQUEST',
      },
      {
        userId: customerCamille.id,
        title: 'Booking Confirmed #CLS-2026-8941',
        message: 'Your booking for the Aurelia Silk Chiffon Gown is confirmed. Garment is being prepared at Atelier Saint-Honoré.',
        link: '/dashboard/customer',
        type: 'BOOKING_CONFIRMED',
      },
    ],
  });

  console.log('✅ Closéa Database seeded successfully!');
  console.log('----------------------------------------------------');
  console.log('Credentials Summary:');
  console.log('👑 Admin:     admin@closea.com / CloseaAdmin2026!');
  console.log('👗 Owner:     sophie.laurent@closea.com / Closea2026!');
  console.log('              elena.vance@closea.com / Closea2026!');
  console.log('👜 Customer:  camille.dupont@closea.com / Closea2026!');
  console.log('              isabella.rossi@closea.com / Closea2026!');
  console.log('🪡 Atelier:   contact@atelier-sainthonore.com / Closea2026!');
  console.log('              contact@retouche-marais.com / Closea2026!');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
