/** 韓文翻譯字典 */
const ko: Record<string, string> = {
    dailyLimitReached: '일일 한도 도달',
    dailyLimitReachedDesc: '오늘의 뽑기 한도가 모두 소진되었습니다. 내일 다시 와주세요!',
    appTitle: 'MIBU 트립',
    appSubtitle: 'AI 여행 가챠',
    destination: '목적지',
    selectDestination: '목적지 선택',
    city: '도시',
    selectCity: '도시 선택',
    startGacha: '가챠 시작',
    generating: '생성 중...',
    findingGems: '숨겨진 명소를 찾는 중',
    tripLevel: 'Lv.{level} 여행',
    spotsCount: '{count}개 장소',
    couponUnlocked: '쿠폰 획득',
    specialPromo: '특별 프로모션',
    noCollection: '아직 컬렉션이 없습니다.',
    startToCollect: '가챠를 돌려 장소를 수집하세요!',
    noCoupons: '아직 쿠폰이 없습니다.',
    navHome: '홈',
    navGacha: '가챠',
    navGachaModule: '여행 가챠',
    navPlanner: '플래너',
    navPlannerModule: '여행 플래너',
    navCollection: '도감',
    navMyBox: '보관함',
    navItems: '보관함',
    navSettings: '설정',
    navLocation: '위치',
    navItinerary: '일정',
    navChat: '채팅',
    navService: '서비스',
    back: '뒤로',
    loading: '로딩 중...',
    login: '로그인',
    signInReplit: 'Replit으로 로그인',
    guestLogin: '게스트 로그인',
    welcomeBack: '환영합니다',
    backToHome: '홈으로 돌아가기',
    catFood: '맛집',
    catStay: '숙박',
    catScenery: '관광',
    catShopping: '쇼핑',
    catEntertainment: '엔터테인먼트',
    catEducation: '에코문화',
    catExperience: '체험',
    relaxed: '여유로운',
    packed: '알찬',
    selectCountry: '국가 선택',
    selectRegion: '도시/지역 선택',
    itineraryPace: '일정 페이스',
    stops: '스톱',
    viewOnMap: 'Google 지도에서 보기',
    rePull: '다시 뽑기',
    places: '장소',
    myCollection: '내 도감',
    spots: '장소',
    announcements: '공지사항',
    flashEvents: '플래시 이벤트',
    explore: '탐색',
    shareLocationToPlanner: '플래너에게 위치 공유',
    yourLocation: '내 위치',
    planner: '플래너',
    safetyCenter: '안전 센터',
    safetyCenterDesc: '여행 중 안전을 위해 긴급 SOS 설정',
    safety: '안전',
    setupEmergencySOS: '긴급 SOS 설정',
    iosShortcutsIntegration: 'iOS 단축어 연동',
    iosShortcutsDesc: '아래 링크를 iOS 단축어에 추가하여 Siri나 자동화로 빠르게 SOS 발신',
    webhookUrl: 'Webhook URL (POST)',
    notAvailable: '링크를 가져올 수 없습니다',
    copyLink: '링크 복사',
    copied: '복사됨',
    setupSteps: '설정 단계:',
    step1: '1. iOS 단축어 앱 열기',
    step2: '2. 새 단축어 만들고 "URL 콘텐츠 가져오기" 추가',
    step3: '3. 위의 Webhook URL 붙여넣기',
    step4: '4. 메서드를 "POST"로 설정',
    step5: '5. Siri 음성 명령 또는 자동화 트리거 설정',
    emergencyNow: '지금 긴급 요청',
    emergencyNowDesc: '버튼을 누르면 긴급 연락처에 SOS 신호를 즉시 보냅니다',
    sosButton: 'SOS 긴급',
    confirmSOS: 'SOS 확인',
    confirmSOSDesc: '긴급 SOS 신호를 보내시겠습니까?',
    cancel: '취소',
    confirmSend: '보내기 확인',
    sent: '전송됨',
    sosSuccess: 'SOS 신호가 성공적으로 전송되었습니다',
    sendFailed: '전송 실패',
    tryAgainLater: '나중에 다시 시도해주세요',
    networkError: '네트워크 오류, 연결을 확인하세요',
    gettingLocation: '위치 가져오는 중...',
    locationPermissionRequired: '이 기능을 사용하려면 위치 권한이 필요합니다',
    unableToGetLocation: '위치를 가져올 수 없습니다',
    retry: '다시 시도',
    viewPool: '가챠 확인',
    poolPreview: '가챠 풀',
    pullCount: '뽑기 횟수',
    selectDistrict: '지역 선택',
    rareItems: '레어 아이템',
    noRareItems: '이 지역에는 레어 아이템이 없습니다',
    closeModal: '닫기',
    pulls: '장',
    loadingPool: '풀 로딩 중...',
    merchant: '파트너',
    generatingItinerary: '일정 생성 중...',
    sponsorAd: '스폰서 광고 (데모)',
    pleaseWait: '잠시만 기다려주세요',
    almostReady: '거의 완료',
    gachaResults: '가챠 결과',
    addToBackpack: '배낭에 추가',
    addedToBackpack: '추가됨!',
    gotCoupon: '쿠폰 획득!',
    partnerMerchant: '파트너',
    rating: '평점',

    // ========== SOS 긴급 연락처 ==========
    sos_emergencyContacts: '긴급 연락처',
    sos_limitReached: '한도 도달',
    sos_limitReachedDesc: '긴급 연락처는 최대 {max}명까지 추가할 수 있습니다',
    sos_incomplete: '미완성',
    sos_enterNamePhone: '이름과 전화번호를 입력해주세요',
    sos_saveFailed: '연락처 저장 실패',
    sos_deleteContact: '연락처 삭제',
    sos_deleteContactConfirm: '"{name}"을(를) 삭제하시겠습니까?',
    sos_deleteContactFailed: '연락처 삭제 실패',
    sos_noContacts: '긴급 연락처가 없습니다',
    sos_tapToAdd: '오른쪽 상단 +를 눌러 연락처를 추가하세요',
    sos_addContact: '연락처 추가',
    sos_editContact: '연락처 편집',
    sos_infoBanner: '최대 {max}명의 긴급 연락처를 추가할 수 있습니다. SOS 전송 시 모두에게 알림이 갑니다.',
    sos_enterName: '이름 입력',
    sos_enterPhone: '전화번호 입력',
    sos_relationship: '관계',
    sos_relFamily: '가족',
    sos_relFriend: '친구',
    sos_relColleague: '동료',
    sos_relOther: '기타',

    // ========== SOS 긴급 화면 ==========
    sos_emergencySOS: '긴급 SOS',
    sos_holdToSend: '아래 버튼을 3초간 길게 누르면 SOS 신호가 전송됩니다',
    sos_hold3sec: '3초 길게 누르기',
    sos_alertHistory: '긴급 알림 기록',
    sos_alertSent: 'SOS 신호가 전송되었습니다',
    sos_willContactYou: '최대한 빨리 연락드리겠습니다',
    sos_sendFailed: '전송 실패',
    sos_tryAgainLater: '나중에 다시 시도해주세요',
    sos_confirmCancel: '취소 확인',
    sos_confirmCancelDesc: '이 긴급 알림을 취소하시겠습니까?',
    sos_no: '아니오',
    sos_yes: '네',
    sos_cancelFailed: '취소 실패',
    sos_cancelAlert: '긴급 알림 취소',
    sos_featureLocked: 'SOS 기능이 잠겨 있습니다',
    sos_requirePurchase: '안전 센터를 사용하려면 여행 서비스를 구매해야 합니다',
    sos_purchaseService: '서비스 구매',
    sos_statusPending: '처리 대기',
    sos_statusAcknowledged: '확인됨',
    sos_statusResolved: '해결됨',
    sos_statusCancelled: '취소됨',

    // ========== 인증 (로그인/회원가입) ==========
    auth_signIn: '로그인',
    auth_signUp: '회원가입',
    auth_username: '계정 (이메일)',
    auth_password: '비밀번호',
    auth_name: '이름',
    auth_selectRole: '역할 선택',
    auth_noAccount: '계정이 없으신가요?',
    auth_hasAccount: '이미 계정이 있으신가요?',
    auth_guestLogin: '게스트 로그인',
    auth_guestNote: '게스트 모드에서는 데이터가 로컬에만 저장됩니다',
    auth_pendingApproval: '가맹점 및 전문가 계정은 관리자 승인이 필요합니다',
    auth_loginFailed: '로그인 실패, 계정과 비밀번호를 확인해주세요',
    auth_registerFailed: '회원가입 실패, 나중에 다시 시도해주세요',
    auth_enterUsernamePassword: '계정과 비밀번호를 입력해주세요',
    auth_fillAllFields: '모든 항목을 입력해주세요',
    auth_roleTraveler: '여행자',
    auth_roleMerchant: '가맹점',
    auth_roleSpecialist: '전문가',

    // ========== 승인 대기 화면 ==========
    auth_pendingTitle: '승인 대기',
    auth_pendingSubtitle: '계정이 관리자 승인을 기다리고 있습니다',
    auth_pendingDescription: '가맹점 및 전문가 계정은 승인 후 모든 기능을 사용할 수 있습니다. 승인되면 알림을 보내드립니다.',
    auth_appliedRole: '신청한 역할',

    // ========== 로그인 페이지 (OAuth) ==========
    auth_notMerchant: 'Not a Merchant', /* TODO: ko */
    auth_notMerchantDesc: 'Please register as a merchant first', /* TODO: ko */
    auth_notSpecialist: 'Not a Specialist', /* TODO: ko */
    auth_notSpecialistDesc: 'Please register as a specialist first', /* TODO: ko */
    auth_wrongPortal: 'Wrong Portal', /* TODO: ko */
    auth_wrongPortalDesc: 'Please switch to the correct portal', /* TODO: ko */
    auth_permissionDenied: 'Permission Denied', /* TODO: ko */
    auth_permissionDeniedDesc: 'You do not have permission', /* TODO: ko */
    auth_oauthLoginFailed: '로그인 실패',
    auth_loginError: '로그인 오류',
    auth_tryAgainLater: '나중에 다시 시도해주세요',
    auth_googleSignInFailed: 'Google 로그인을 완료할 수 없습니다', /* TODO: ko */
    auth_appleSignInFailed: 'Apple 로그인을 완료할 수 없습니다', /* TODO: ko */
    auth_cannotConnectServer: '서버에 연결할 수 없습니다', /* TODO: ko */
    auth_networkError: '네트워크 오류',
    auth_switchPortal: '포털 전환',
    auth_googleLogin: 'Google 로그인',
    auth_switchLanguage: '언어 전환',
    auth_switchTo: '전환',
    auth_applicationSubmitted: '신청이 제출되었습니다!',
    auth_applicationReceivedMsg: '신청서를 접수했습니다. 곧 처리하겠습니다',
    auth_applicationApprovalNote: '승인 후 알림을 받으시면 계정으로 로그인하실 수 있습니다',
    auth_backToLogin: '로그인 페이지로 돌아가기',
    auth_registrationFailed: 'Registration Failed', /* TODO: ko */
    auth_registrationError: 'Registration failed. Please try again.', /* TODO: ko */
    auth_suggestMergeTitle: '기존 계정 감지',
    auth_suggestMergeHasAccount: '이 기기에서 계정 "{name}"이(가) 발견되었습니다.',
    auth_suggestMergeHint: '계정을 병합하려면 설정 > 계정 병합으로 이동하세요.',

    // ========== 게스트 모드 ==========
    guest_loginRequired: '로그인 필요',
    guest_profileLoginDesc: '로그인하여 프로필과 아바타를 관리하세요',
    guest_goToLogin: '로그인하기',

    // ========== 가맹점 등록 (양식) ==========
    merchant_registration: 'Merchant Registration', /* TODO: ko */
    merchant_registrationSubtitle: 'Fill in your details to apply', /* TODO: ko */
    merchant_regOwnerName: 'Owner Name', /* TODO: ko */
    merchant_regOwnerNamePlaceholder: 'Enter owner name', /* TODO: ko */
    merchant_regBusinessName: 'Business Name', /* TODO: ko */
    merchant_regBusinessNamePlaceholder: 'Enter business name', /* TODO: ko */
    merchant_regTaxId: 'Tax ID (Optional)', /* TODO: ko */
    merchant_regTaxIdPlaceholder: 'Enter tax ID', /* TODO: ko */
    merchant_regBusinessCategory: 'Business Category', /* TODO: ko */
    merchant_regBusinessCategoryPlaceholder: 'Select business category', /* TODO: ko */
    merchant_regAddress: 'Business Address', /* TODO: ko */
    merchant_regAddressPlaceholder: 'Enter business address', /* TODO: ko */
    merchant_regPhone: 'Phone (Optional)', /* TODO: ko */
    merchant_regPhonePlaceholder: 'Enter phone number', /* TODO: ko */
    merchant_regMobile: 'Mobile', /* TODO: ko */
    merchant_regMobilePlaceholder: 'Enter mobile number', /* TODO: ko */
    merchant_regEmailPlaceholder: 'Enter email', /* TODO: ko */
    merchant_regSubmitReview: 'Submit for Review', /* TODO: ko */
    merchant_regSubmitting: 'Submitting...', /* TODO: ko */
    merchant_regSubmitSuccess: 'Submitted Successfully', /* TODO: ko */
    merchant_regSubmitSuccessMsg: 'Your application has been submitted.', /* TODO: ko */
    merchant_regSubmitFailed: 'Submission failed.', /* TODO: ko */
    merchant_regFillRequired: 'Please fill in all required fields', /* TODO: ko */
    merchant_regInvalidEmail: 'Please enter a valid email', /* TODO: ko */
    merchant_regCatRestaurant: 'Restaurant', /* TODO: ko */
    merchant_regCatHotel: 'Hotel', /* TODO: ko */
    merchant_regCatAttraction: 'Attraction', /* TODO: ko */
    merchant_regCatShopping: 'Shopping', /* TODO: ko */
    merchant_regCatTransportation: 'Transportation', /* TODO: ko */
    merchant_regCatExperience: 'Experience', /* TODO: ko */
    merchant_regCatCulture: 'Culture/Art', /* TODO: ko */
    merchant_regCatOther: 'Other', /* TODO: ko */
    merchant_regEmail: 'Email (Account)', /* TODO: ko */
    merchant_regPassword: 'Password (min 6 chars)', /* TODO: ko */
    merchant_regConfirmPassword: 'Confirm Password', /* TODO: ko */
    merchant_regContactName: 'Contact Name', /* TODO: ko */
    merchant_regIndustryCategory: 'Business Category', /* TODO: ko */
    merchant_regBusinessAddress: 'Business Address', /* TODO: ko */
    merchant_regOtherContact: 'Other Contact (Optional)', /* TODO: ko */
    merchant_regBackToLogin: 'Back to Login', /* TODO: ko */
    merchant_regSelectCategory: 'Select Category', /* TODO: ko */
    merchant_regEnterEmail: 'Please enter email', /* TODO: ko */
    merchant_regInvalidEmailFormat: 'Invalid email format', /* TODO: ko */
    merchant_regPasswordMinLength: 'Password must be at least 6 characters', /* TODO: ko */
    merchant_regPasswordMismatch: 'Passwords do not match', /* TODO: ko */
    merchant_regEnterBusinessName: 'Please enter business name', /* TODO: ko */
    merchant_regEnterContactName: 'Please enter contact name', /* TODO: ko */
    merchant_regSelectIndustry: 'Please select category', /* TODO: ko */
    merchant_regEnterAddress: 'Please enter address', /* TODO: ko */
    merchant_regContactNamePlaceholder: 'Enter contact name', /* TODO: ko */
    merchant_regTaxIdShort: 'Tax ID', /* TODO: ko */
    merchant_regLineOrPhone: 'LINE ID or Phone', /* TODO: ko */
    merchant_regCatRestaurantShort: 'Restaurant', /* TODO: ko */
    merchant_regCatHotelShort: 'Hotel', /* TODO: ko */
    merchant_regCatAttractionShort: 'Attraction', /* TODO: ko */
    merchant_regCatShoppingShort: 'Shopping', /* TODO: ko */
    merchant_regCatActivityShort: 'Activity', /* TODO: ko */
    merchant_regCatOtherShort: 'Other', /* TODO: ko */

    // ========== 전문가 등록 ==========
    specialist_registration: 'Specialist Registration', /* TODO: ko */
    specialist_emailAccount: 'Email (Account)', /* TODO: ko */
    specialist_passwordMin: 'Password (min 6 chars)', /* TODO: ko */
    specialist_confirmPassword: 'Confirm Password', /* TODO: ko */
    specialist_nameLabel: 'Name', /* TODO: ko */
    specialist_otherContact: 'Other Contact (Optional)', /* TODO: ko */
    specialist_serviceRegionOptional: 'Service Region (Optional)', /* TODO: ko */
    specialist_submitApplication: 'Submit Application', /* TODO: ko */
    specialist_backToLogin: 'Back to Login', /* TODO: ko */
    specialist_enterEmail: 'Please enter email', /* TODO: ko */
    specialist_invalidEmailFormat: 'Invalid email format', /* TODO: ko */
    specialist_passwordMinLength: 'Password must be at least 6 characters', /* TODO: ko */
    specialist_passwordMismatch: 'Passwords do not match', /* TODO: ko */
    specialist_enterName: 'Please enter name', /* TODO: ko */
    specialist_namePlaceholder: 'Enter your name', /* TODO: ko */
    specialist_regionPlaceholder: 'e.g., Taipei, Yilan', /* TODO: ko */
    specialist_lineOrPhone: 'LINE ID or Phone', /* TODO: ko */

    // ========== 즐겨찾기/블랙리스트 ==========
    itinerary_favoritesAndBlacklist: 'Favorites & Blacklist', /* TODO: ko */
    itinerary_favorites: '즐겨찾기',
    itinerary_blacklist: '블랙리스트',
    itinerary_removeFavorite: '즐겨찾기 삭제', /* TODO: ko */
    itinerary_removeFavoriteConfirm: '즐겨찾기에서 삭제하시겠습니까?', /* TODO: ko */
    itinerary_removeBlacklist: '블랙리스트에서 삭제', /* TODO: ko */
    itinerary_removeBlacklistConfirm: '블랙리스트에서 삭제하시겠습니까?', /* TODO: ko */
    itinerary_noFavorites: '즐겨찾기가 없습니다', /* TODO: ko */
    itinerary_addFavoritesHint: 'Add favorites from collection', /* TODO: ko */
    itinerary_noBlacklist: '블랙리스트가 없습니다', /* TODO: ko */
    itinerary_addBlacklistHint: 'Add items to blacklist', /* TODO: ko */
    itinerary_favoritesGachaHint: 'Favorite places appear more often in gacha', /* TODO: ko */
    itinerary_blacklistGachaHint: 'Blacklisted items will not appear in gacha', /* TODO: ko */

    // ========== 이벤트 상세 ==========
    common_eventNotFound: '이벤트를 찾을 수 없습니다', /* TODO: ko */
    common_goBack: '돌아가기',
    common_description: '설명',
    common_learnMore: '자세히 보기',
    event_announcement: '공지', /* TODO: ko */
    event_festival: '축제', /* TODO: ko */
    event_limited: '기간 한정 이벤트', /* TODO: ko */

    noResults: '아직 결과가 없습니다',
    tryGachaFirst: '먼저 가챠를 뽑아보세요!',
    viewResults: '결과 보기',
    exploring: '탐색 중',
    reGacha: '다시 가챠',
    emptyItemBox: '보관함이 비어 있습니다',
    collectItemsFirst: '가챠로 장소를 수집하세요!',
    totalItems: '합계',
    itemsCount: '아이템',

    // ========== 공통 (화면 공통) ==========
    common_error: '오류',
    common_confirm: '확인',
    common_delete: '삭제',
    common_save: '저장',
    common_edit: '편집',
    common_remove: '제거',
    common_done: '완료',
    common_submit: '제출',
    common_search: '검색',
    common_logout: '로그아웃',
    common_success: '성공',
    common_loadFailed: '로드 실패',
    common_saveFailed: '저장 실패',
    common_deleteFailed: '삭제 실패',
    common_createFailed: '생성 실패',
    common_updateFailed: '업데이트 실패',
    common_saveTryAgain: '저장 실패, 나중에 다시 시도해 주세요',
    common_notice: '알림',
    common_errorTryAgain: '오류가 발생했습니다. 다시 시도해 주세요.',
    common_noData: '데이터 없음',
    common_fillRequired: '필수 항목을 입력해 주세요',
    common_confirmDelete: '삭제 확인',
    common_confirmLogout: '로그아웃 확인',
    common_confirmLogoutDesc: '로그아웃하시겠습니까?',
    common_deleteAccount: '계정 삭제',
    common_required: '필수',
    common_name: '이름',
    common_email: '이메일',
    common_password: '비밀번호',
    common_phone: '전화',
    common_address: '주소',
    common_status: '상태',
    common_place: '장소',
    common_coupon: '쿠폰',
    common_pending: '대기 중',
    common_approved: '승인됨',
    common_rejected: '거부됨',
    common_active: '활성',
    common_inactive: '비활성',
    common_verified: '인증됨',
    common_switchRole: '역할 전환',
    common_roleTraveler: '여행자',
    common_roleMerchant: '상점',
    common_roleSpecialist: '전문가',
    common_roleAdmin: '관리자',
    common_skip: '건너뛰기',
    common_back: '이전',
    common_next: '다음',
    common_getStarted: '시작하기',

    // ========== Admin ==========
    admin_title: '관리 대시보드',
    admin_pendingTab: '승인 대기',
    admin_usersTab: '사용자',
    admin_draftsTab: '초안',
    admin_exclusionsTab: '제외',
    admin_announcementsTab: '공지사항',
    admin_approve: '승인',
    admin_reject: '거부',
    admin_publish: '게시',
    admin_noPending: '승인 대기 중인 사용자가 없습니다',
    admin_merchant: '가맹점', /* TODO: ko */
    admin_specialist: 'Specialist', /* TODO: ko */
    admin_traveler: '여행자',
    admin_admin: '관리자',
    admin_confirmApprove: '이 사용자를 승인하시겠습니까?',
    admin_confirmReject: '이 사용자를 거부하시겠습니까?',
    admin_confirmPublish: '이 초안을 게시하시겠습니까?',
    admin_confirmDelete: '삭제하시겠습니까?',
    admin_penalty: '감점',
    admin_goToAnnouncement: '공지사항 관리로 이동',
    admin_announcementManage: '공지사항 관리',
    admin_add: '추가',
    admin_type: '유형',
    admin_titleLabel: '제목',
    admin_contentLabel: '내용',
    admin_imageUrl: '이미지 URL',
    admin_linkUrl: '링크 URL',
    admin_priority: '우선순위',
    admin_noAnnouncements: '공지사항이 없습니다',
    admin_confirmDeleteAnnouncement: '이 공지사항을 삭제하시겠습니까?',
    admin_createAnnouncement: '공지사항 작성',
    admin_editAnnouncement: '공지사항 편집',
    admin_fillTitleContent: '제목과 내용을 입력해 주세요',
    admin_enterTitle: '제목 입력',
    admin_enterContent: '내용 입력',
    admin_typeAnnouncement: '공지',
    admin_typeFlashEvent: '플래시 이벤트',
    admin_typeHolidayEvent: '시즌 이벤트',
    admin_startDateLabel: '시작일',
    admin_endDateLabel: '종료일',
    admin_isActiveLabel: '활성',
    admin_datePlaceholder: 'YYYY-MM-DD',

    // #047 보상 발송
    admin_rewardsTab: '보상',
    admin_sendReward: '보상 발송',
    admin_rewardTarget: '발송 대상',
    admin_rewardTargetAll: '전체 사용자',
    admin_rewardTargetUsers: '지정 사용자',
    admin_rewardTitle: '보상 제목',
    admin_rewardMessage: '메시지 (선택)',
    admin_rewardType: '보상 유형',
    admin_rewardAmount: '수량',
    admin_rewardItemCode: '아이템 코드',
    admin_rewardUserIds: '사용자 ID (줄당 하나)',
    admin_rewardAddItem: '보상 항목 추가',
    admin_rewardSending: '발송 중...',
    admin_rewardSuccess: '보상이 발송되었습니다',
    admin_rewardSentStats: '{sent}/{total}명에게 {batches}배치로 발송 완료',
    admin_rewardFillRequired: '제목을 입력하고 보상을 하나 이상 추가하세요',
    admin_rewardNoUsers: '사용자 ID를 하나 이상 입력하세요',
    admin_rewardCoins: '코인',
    admin_rewardShopItem: '상점 아이템',
    admin_rewardPerk: '특전 부스트',
    admin_rewardRemoveItem: '삭제',
    admin_expiresInDays: '만료일 (일수, 선택)',

    // #048 상점 아이템 관리
    admin_shopItemsTab: '상점',
    admin_shopItemsManage: '상점 아이템 관리',
    admin_shopItemCreate: '아이템 추가',
    admin_shopItemEdit: '아이템 편집',
    admin_shopItemCode: '아이템 코드',
    admin_shopItemName: '아이템 이름',
    admin_shopItemNameEn: '영문 이름 (선택)',
    admin_shopItemDesc: '설명',
    admin_shopItemDescEn: '영문 설명 (선택)',
    admin_shopItemPrice: '가격 (코인)',
    admin_shopItemCategory: '카테고리',
    admin_shopItemMaxPerUser: '1인당 구매 제한 (선택)',
    admin_shopItemActive: '판매 중',
    admin_shopItemInactive: '판매 중지',
    admin_shopItemConfirmDelete: '이 아이템을 비활성화하시겠습니까?',
    admin_shopItemNoItems: '아이템이 없습니다',
    admin_shopItemSortOrder: '정렬 순서',
    admin_shopCatGachaTicket: '가챠 티켓',
    admin_shopCatInventoryExpand: '인벤토리 확장',
    admin_shopCatCosmetic: '장식',
    admin_shopCatBoost: '부스트',
    admin_shopCatBundle: '번들',
    admin_shopCatOther: '기타',
    admin_shopItemFillRequired: '코드, 이름, 가격을 입력하세요',

    // ========== 스페셜리스트 모듈 ==========
    specialist_dashboard: 'Specialist Dashboard', /* TODO: ko */
    specialist_online: 'Online', /* TODO: ko */
    specialist_offline: 'Offline', /* TODO: ko */
    specialist_onlineStatus: 'Online Status', /* TODO: ko */
    specialist_activeServices: 'Active Services', /* TODO: ko */
    specialist_noServices: 'No active services', /* TODO: ko */
    specialist_since: 'Since', /* TODO: ko */
    specialist_region: 'Region', /* TODO: ko */
    specialist_activeTravelers: 'Active Travelers', /* TODO: ko */
    specialist_viewTravelers: 'View travelers being served', /* TODO: ko */
    specialist_liveTracking: 'Live Tracking', /* TODO: ko */
    specialist_viewTravelersOnMap: 'View travelers on map', /* TODO: ko */
    specialist_serviceHistory: 'Service History', /* TODO: ko */
    specialist_viewPastRecords: 'View past service records', /* TODO: ko */
    specialist_profile: 'Specialist Profile', /* TODO: ko */
    specialist_viewEditProfile: 'View and edit profile', /* TODO: ko */
    specialist_filterAll: 'All', /* TODO: ko */
    specialist_completed: 'Completed', /* TODO: ko */
    specialist_cancelled: 'Cancelled', /* TODO: ko */
    specialist_noHistory: 'No service history', /* TODO: ko */
    specialist_traveler: 'Traveler', /* TODO: ko */
    specialist_noActiveTravelers: 'No active travelers', /* TODO: ko */
    specialist_viewLocation: 'View Location', /* TODO: ko */
    specialist_connecting: 'Connecting...', /* TODO: ko */
    specialist_connected: 'Connected', /* TODO: ko */
    specialist_disconnected: 'Disconnected', /* TODO: ko */
    specialist_noLocations: 'No traveler locations yet', /* TODO: ko */
    specialist_lastUpdate: 'Last update', /* TODO: ko */
    specialist_travelers: 'travelers', /* TODO: ko */
    specialist_mapNotAvailableWeb: 'Map not available on web', /* TODO: ko */
    specialist_mapRequiresNative: 'Map Area - requires react-native-maps', /* TODO: ko */
    specialist_travelerLocations: 'Traveler Locations', /* TODO: ko */
    specialist_accountStatus: 'Account Status', /* TODO: ko */
    specialist_available: 'Available', /* TODO: ko */
    specialist_unavailable: 'Unavailable', /* TODO: ko */
    specialist_currentlyServing: 'Currently Serving', /* TODO: ko */
    specialist_maxTravelers: 'Max Travelers', /* TODO: ko */
    specialist_serviceRegion: 'Service Region', /* TODO: ko */
    specialist_people: '', /* TODO: ko */

    // ========== Merchant ==========
    merchant_productMgmt: 'Product Management', /* TODO: ko */
    merchant_myProducts: 'My Products', /* TODO: ko */
    merchant_noProducts: 'No products yet', /* TODO: ko */
    merchant_addProduct: 'Add Product', /* TODO: ko */
    merchant_productName: 'Product Name', /* TODO: ko */
    merchant_productDesc: 'Description', /* TODO: ko */
    merchant_price: 'Price', /* TODO: ko */
    merchant_discountPrice: 'Discount Price', /* TODO: ko */
    merchant_activeStatus: 'Active', /* TODO: ko */
    merchant_inactiveStatus: 'Inactive', /* TODO: ko */
    merchant_deleteProductConfirm: 'Delete this product?', /* TODO: ko */
    merchant_deleted: 'Deleted', /* TODO: ko */
    merchant_saved: 'Saved', /* TODO: ko */
    merchant_couponAddTitle: 'Add Coupon', /* TODO: ko */
    merchant_couponEditTitle: 'Edit Coupon', /* TODO: ko */
    merchant_couponName: 'Coupon Name', /* TODO: ko */
    merchant_couponNamePlaceholder: 'e.g. 10% Off', /* TODO: ko */
    merchant_rarityTier: 'Rarity Tier', /* TODO: ko */
    merchant_tierHint: 'Higher tier = lower draw rate', /* TODO: ko */
    merchant_discountContent: 'Discount Content', /* TODO: ko */
    merchant_discountContentPlaceholder: 'Describe the discount...', /* TODO: ko */
    merchant_terms: 'Terms & Conditions', /* TODO: ko */
    merchant_termsPlaceholder: 'Usage restrictions (optional)', /* TODO: ko */
    merchant_quantity: 'Quantity', /* TODO: ko */
    merchant_quantityHint: 'Total coupons to distribute', /* TODO: ko */
    merchant_validUntil: 'Valid Until', /* TODO: ko */
    merchant_validUntilHint: 'Leave empty for no expiration', /* TODO: ko */
    merchant_activateNow: 'Activate Now', /* TODO: ko */
    merchant_saveSuccess: 'Saved successfully', /* TODO: ko */
    merchant_notice: 'Notice', /* TODO: ko */
    merchant_addPlace: 'Add New Place', /* TODO: ko */
    merchant_addPlaceSubtitle: 'Fill in your place information', /* TODO: ko */
    merchant_placeName: 'Place Name', /* TODO: ko */
    merchant_placeNamePlaceholder: 'Enter place name', /* TODO: ko */
    merchant_category: 'Category', /* TODO: ko */
    merchant_selectCategory: 'Select category', /* TODO: ko */
    merchant_district: 'District', /* TODO: ko */
    merchant_districtPlaceholder: "e.g. Da'an District", /* TODO: ko */
    merchant_city: 'City', /* TODO: ko */
    merchant_cityPlaceholder: 'e.g. Taipei', /* TODO: ko */
    merchant_placeAddress: 'Address', /* TODO: ko */
    merchant_addressPlaceholder: 'Full address', /* TODO: ko */
    merchant_placeDesc: 'Description', /* TODO: ko */
    merchant_placeDescPlaceholder: 'Brief introduction of your place...', /* TODO: ko */
    merchant_submitApplication: 'Submit', /* TODO: ko */
    merchant_applicationSubmitted: 'Application submitted! We will review it soon.', /* TODO: ko */
    merchant_submitError: 'Submit failed, please try again', /* TODO: ko */
    merchant_catFood: 'Food', /* TODO: ko */
    merchant_catStay: 'Stay', /* TODO: ko */
    merchant_catScenery: 'Scenery', /* TODO: ko */
    merchant_catShopping: 'Shopping', /* TODO: ko */
    merchant_catEntertainment: 'Entertainment', /* TODO: ko */
    merchant_catEducation: 'Education', /* TODO: ko */
    merchant_analytics: 'Analytics', /* TODO: ko */
    merchant_overview: 'Overview', /* TODO: ko */
    merchant_totalExposures: 'Total Exposures', /* TODO: ko */
    merchant_totalCollectors: 'Total Collectors', /* TODO: ko */
    merchant_couponIssued: 'Coupons Issued', /* TODO: ko */
    merchant_couponRedeemed: 'Coupons Redeemed', /* TODO: ko */
    merchant_redemptionRate: 'Redemption Rate', /* TODO: ko */
    merchant_topCoupons: 'Top Coupons', /* TODO: ko */
    merchant_placeBreakdown: 'Place Breakdown', /* TODO: ko */
    merchant_allPlaces: 'All Places', /* TODO: ko */
    merchant_selectPlace: 'Select Place', /* TODO: ko */
    merchant_noDataYet: 'No data', /* TODO: ko */
    merchant_times: 'times', /* TODO: ko */
    merchant_people: 'people', /* TODO: ko */
    merchant_issued: 'Issued', /* TODO: ko */
    merchant_redeemed: 'Redeemed', /* TODO: ko */
    merchant_collectionCount: 'Collections', /* TODO: ko */
    merchant_7days: '7 Days', /* TODO: ko */
    merchant_30days: '30 Days', /* TODO: ko */
    merchant_90days: '90 Days', /* TODO: ko */
    merchant_allPeriod: 'All', /* TODO: ko */
    merchant_couponMgmt: 'Coupon Management', /* TODO: ko */
    merchant_couponMgmtSubtitle: 'Create and manage your coupons', /* TODO: ko */
    merchant_addCoupon: 'Add Coupon', /* TODO: ko */
    merchant_noCoupons: 'No coupons yet', /* TODO: ko */
    merchant_noCouponsHint: 'Start creating your first coupon', /* TODO: ko */
    merchant_remaining: 'Remaining', /* TODO: ko */
    merchant_couponActive: 'Active', /* TODO: ko */
    merchant_couponInactive: 'Inactive', /* TODO: ko */
    merchant_couponExpired: 'Expired', /* TODO: ko */
    merchant_confirmDeleteCoupon: 'Delete this coupon?', /* TODO: ko */
    merchant_deleteSuccess: 'Deleted successfully', /* TODO: ko */
    merchant_drawRate: 'Draw rate', /* TODO: ko */
    merchant_couponValidUntil: 'Valid until', /* TODO: ko */
    merchant_couponLoadFailed: 'Failed to load coupons', /* TODO: ko */
    merchant_couponLoadFailedDetail: 'Please check your connection and try again', /* TODO: ko */
    merchant_verifyTitle: 'Verify Code', /* TODO: ko */
    merchant_merchantIdLabel: 'Merchant ID', /* TODO: ko */
    merchant_merchantIdPlaceholder: 'Enter Merchant ID', /* TODO: ko */
    merchant_codeLabel: 'Verification Code', /* TODO: ko */
    merchant_codePlaceholder: 'Enter code', /* TODO: ko */
    merchant_verify: 'Verify', /* TODO: ko */
    merchant_verifying: 'Verifying...', /* TODO: ko */
    merchant_verifyValid: 'Valid', /* TODO: ko */
    merchant_verifyInvalid: 'Invalid', /* TODO: ko */
    merchant_errorEmpty: 'Please enter merchant ID and code', /* TODO: ko */
    merchant_tryAgain: 'Try Again', /* TODO: ko */
    merchant_merchantIdMustBeNumber: 'Merchant ID must be a number', /* TODO: ko */
    merchant_codeValid: 'Code is valid', /* TODO: ko */
    merchant_codeInvalid: 'Code is invalid', /* TODO: ko */
    merchant_verifyFailed: 'Verification failed', /* TODO: ko */
    merchant_claimTitle: 'Claim Place', /* TODO: ko */
    merchant_claimSubtitle: 'Search and claim your place', /* TODO: ko */
    merchant_searchPlaceholder: 'Enter place name...', /* TODO: ko */
    merchant_claim: 'Claim', /* TODO: ko */
    merchant_claimed: 'Claimed', /* TODO: ko */
    merchant_noSearchResults: 'No matching places found', /* TODO: ko */
    merchant_noResultsHint: 'Try other keywords, or add your own place', /* TODO: ko */
    merchant_addNewPlace: 'Add New Place', /* TODO: ko */
    merchant_claimSuccess: 'Claimed successfully!', /* TODO: ko */
    merchant_claimFailed: 'Claim failed', /* TODO: ko */
    merchant_searchHint: 'Enter place name to search', /* TODO: ko */
    merchant_searchFailed: 'Search failed', /* TODO: ko */
    merchant_myPlaces: 'My Places', /* TODO: ko */
    merchant_myPlacesSubtitle: 'Manage your claimed places', /* TODO: ko */
    merchant_noPlaces: 'No places claimed yet', /* TODO: ko */
    merchant_noPlacesHint: 'Start claiming or adding your places', /* TODO: ko */
    merchant_claimExisting: 'Claim Existing Place', /* TODO: ko */
    merchant_placesCount: '{n} place(s)', /* TODO: ko */
    merchant_transactionHistory: 'Transaction History', /* TODO: ko */
    merchant_noTransactions: 'No transactions yet', /* TODO: ko */
    merchant_purchase: 'Purchase', /* TODO: ko */
    merchant_usage: 'Usage', /* TODO: ko */
    merchant_refund: 'Refund', /* TODO: ko */
    merchant_appFormTitle: 'Merchant Application', /* TODO: ko */
    merchant_appFormSubtitle: 'Fill in the details below. Review takes 1-3 business days.', /* TODO: ko */
    merchant_ownerName: 'Owner Name *', /* TODO: ko */
    merchant_businessName: 'Business Name *', /* TODO: ko */
    merchant_taxId: 'Tax ID', /* TODO: ko */
    merchant_businessCategoryLabel: 'Business Category *', /* TODO: ko */
    merchant_merchantPhone: 'Phone', /* TODO: ko */
    merchant_merchantMobile: 'Mobile *', /* TODO: ko */
    merchant_contactEmail: 'Contact Email *', /* TODO: ko */
    merchant_submitAppForm: 'Submit Application', /* TODO: ko */
    merchant_requiredFields: 'Please fill all required fields', /* TODO: ko */
    merchant_submitSuccess: 'Application submitted. Awaiting review.', /* TODO: ko */
    merchant_submitFailed: 'Submission failed. Please try again.', /* TODO: ko */
    merchant_enterOwnerName: 'Enter owner name', /* TODO: ko */
    merchant_enterBusinessName: 'Enter business name', /* TODO: ko */
    merchant_enterAddress: 'Enter business address', /* TODO: ko */
    merchant_optional: 'Optional', /* TODO: ko */
    merchant_catRestaurant: 'Restaurant', /* TODO: ko */
    merchant_catRetail: 'Retail', /* TODO: ko */
    merchant_catHotel: 'Hotel', /* TODO: ko */
    merchant_catService: 'Service', /* TODO: ko */
    merchant_catOther: 'Other', /* TODO: ko */
    merchant_catAttraction: 'Attraction/Entertainment', /* TODO: ko */
    merchant_catTransportation: 'Transportation', /* TODO: ko */
    merchant_catExperience: 'Experience/Activity', /* TODO: ko */
    merchant_catCulture: 'Culture/Art', /* TODO: ko */

    // ========== Crowdfunding ==========
    crowdfunding_title: '세계 지도 잠금 해제', /* TODO: ko */
    crowdfunding_loadFailed: '로드 실패', /* TODO: ko */
    crowdfunding_loadFailedDesc: '크라우드펀딩을 불러오지 못했습니다', /* TODO: ko */
    crowdfunding_statUnlocked: '잠금 해제', /* TODO: ko */
    crowdfunding_statFundraising: '모금 중', /* TODO: ko */
    crowdfunding_statComing: '곧 오픈', /* TODO: ko */
    crowdfunding_availableRegions: '이용 가능 지역', /* TODO: ko */
    crowdfunding_fundraising: '모금 중', /* TODO: ko */
    crowdfunding_comingSoon: '곧 오픈', /* TODO: ko */
    crowdfunding_stayTuned: '기대해 주세요', /* TODO: ko */
    crowdfunding_noProjects: '진행 중인 프로젝트가 없습니다', /* TODO: ko */
    crowdfunding_stayTunedDesc: '새로운 지역 오픈을 기대해 주세요', /* TODO: ko */
    crowdfunding_myContributions: '후원 내역', /* TODO: ko */
    crowdfunding_totalContributions: '총 후원액', /* TODO: ko */
    crowdfunding_supportVision: '우리의 비전을 응원해주세요', /* TODO: ko */
    crowdfunding_statusUnlocked: 'Unlocked', /* TODO: ko */
    crowdfunding_statusFundraising: 'Fundraising', /* TODO: ko */
    crowdfunding_statusComingSoon: 'Coming Soon', /* TODO: ko */
    crowdfunding_statusStayTuned: 'Stay Tuned', /* TODO: ko */
    crowdfunding_loadFailedDetail: 'Failed to load campaign details', /* TODO: ko */
    crowdfunding_notFound: 'Campaign not found', /* TODO: ko */
    crowdfunding_goBack: 'Go Back', /* TODO: ko */
    crowdfunding_raised: 'Raised', /* TODO: ko */
    crowdfunding_backers: 'Backers', /* TODO: ko */
    crowdfunding_daysLeft: 'Days Left', /* TODO: ko */
    crowdfunding_goal: 'Goal: ', /* TODO: ko */
    crowdfunding_youBacked: 'You backed ', /* TODO: ko */
    crowdfunding_about: 'About', /* TODO: ko */
    crowdfunding_rewardTiers: 'Reward Tiers', /* TODO: ko */
    crowdfunding_updates: 'Updates', /* TODO: ko */
    crowdfunding_soldOut: 'Sold Out', /* TODO: ko */
    crowdfunding_remaining: '{count} left', /* TODO: ko */
    crowdfunding_selectTier: 'Select a Tier', /* TODO: ko */
    crowdfunding_selectTierDesc: 'Please select a reward tier first', /* TODO: ko */
    crowdfunding_testMode: 'Test Mode', /* TODO: ko */
    crowdfunding_testModeDesc: 'You selected "{tier}" tier ({amount})\n\nReal purchase will be enabled after launch.', /* TODO: ko */
    crowdfunding_simulateSuccess: 'Simulate Success', /* TODO: ko */
    crowdfunding_thankYou: 'Thank you!', /* TODO: ko */
    crowdfunding_thankYouDesc: 'Thank you for your support!', /* TODO: ko */
    crowdfunding_thankYouDescFull: 'Thank you for your support! Your contribution has been processed.', /* TODO: ko */
    crowdfunding_purchaseFailed: 'Purchase Failed', /* TODO: ko */
    crowdfunding_purchaseFailedDesc: 'Could not complete purchase. Please try again.', /* TODO: ko */
    crowdfunding_purchaseError: 'An error occurred during purchase. Please try again.', /* TODO: ko */
    crowdfunding_processing: 'Processing...', /* TODO: ko */
    crowdfunding_backAmount: 'Back {amount}', /* TODO: ko */
    crowdfunding_selectATier: 'Select a Tier', /* TODO: ko */

    // ========== Referral ==========
    referral_inviteFriends: 'Invite Friends', /* TODO: ko */
    referral_myCode: 'My Referral Code', /* TODO: ko */
    referral_copy: 'Copy', /* TODO: ko */
    referral_share: 'Share', /* TODO: ko */
    referral_generateTitle: 'Generate Your Code', /* TODO: ko */
    referral_generateSubtitle: 'Share with friends and earn rewards together', /* TODO: ko */
    referral_generateNow: 'Generate Now', /* TODO: ko */
    referral_generateError: 'Failed to generate code', /* TODO: ko */
    referral_copied: 'Copied!', /* TODO: ko */
    referral_copiedDesc: 'Code copied to clipboard', /* TODO: ko */
    referral_shareMessage: 'Use my code {code} to join Mibu and discover new travel experiences! Download: https://mibu.app', /* TODO: ko */
    referral_invited: 'Invited', /* TODO: ko */
    referral_successful: 'Successful', /* TODO: ko */
    referral_xpEarned: 'XP Earned', /* TODO: ko */
    referral_howItWorks: 'How It Works', /* TODO: ko */
    referral_step1Title: 'Share Your Code', /* TODO: ko */
    referral_step1Desc: 'Copy and share your unique referral code', /* TODO: ko */
    referral_step2Title: 'Friend Signs Up', /* TODO: ko */
    referral_step2Desc: 'Your friend registers using your code', /* TODO: ko */
    referral_step3Title: 'Both Earn Rewards', /* TODO: ko */
    referral_step3Desc: 'You and your friend each earn 50 XP', /* TODO: ko */
    referral_weeklyLeaderboard: 'Weekly Leaderboard', /* TODO: ko */
    referral_you: 'You', /* TODO: ko */
    referral_noRanking: 'No ranking data yet', /* TODO: ko */
    referral_beFirst: 'Be the first to invite friends!', /* TODO: ko */
    referral_yourRank: 'Your current rank: #{rank}', /* TODO: ko */
    referral_inviteRewards: 'Invite Rewards', /* TODO: ko */
    referral_inviteCount: 'Invite {count} friends', /* TODO: ko */
    referral_achieved: 'Done', /* TODO: ko */
    referral_remaining: '{count} more', /* TODO: ko */
    referral_enterCode: "Enter Friend's Code", /* TODO: ko */
    referral_enterCodeHint: 'Have a referral code? Enter to earn rewards', /* TODO: ko */
    referral_enterCodePlaceholder: 'Enter code', /* TODO: ko */
    referral_invalidCode: 'Invalid Code', /* TODO: ko */
    referral_invalidCodeDesc: 'This code is not valid', /* TODO: ko */
    referral_applySuccess: 'Success!', /* TODO: ko */
    referral_applySuccessDesc: 'Referral code applied! You earned {amount} coins', /* TODO: ko */
    referral_applyError: 'Failed to apply code', /* TODO: ko */
    referral_inviteHistory: 'Invite History', /* TODO: ko */

    // ========== Contribution ==========
    contribution_title: 'Contributions', /* TODO: ko */
    contribution_tabReport: 'Report', /* TODO: ko */
    contribution_tabSuggest: 'Suggest', /* TODO: ko */
    contribution_tabVote: 'Vote', /* TODO: ko */
    contribution_loadFailed: 'Load Failed', /* TODO: ko */
    contribution_loadFailedDesc: 'Failed to load contribution data. Please try again later.', /* TODO: ko */
    contribution_reportFeature: 'Report Feature', /* TODO: ko */
    contribution_reportFeatureDesc: 'Please use the "Report" button on place cards in your collection', /* TODO: ko */
    contribution_reportClosure: 'Report Closure', /* TODO: ko */
    contribution_reportClosureDesc: 'Earn coins by helping update place info', /* TODO: ko */
    contribution_myReports: 'My Reports', /* TODO: ko */
    contribution_noReports: 'No reports yet', /* TODO: ko */
    contribution_statusPending: 'Pending', /* TODO: ko */
    contribution_statusVerified: 'Verified', /* TODO: ko */
    contribution_statusRejected: 'Rejected', /* TODO: ko */
    contribution_suggestFeature: 'Suggest Feature', /* TODO: ko */
    contribution_suggestFeatureDesc: 'Place suggestion feature coming soon', /* TODO: ko */
    contribution_suggestPlace: 'Suggest a Place', /* TODO: ko */
    contribution_suggestPlaceDesc: 'Earn coins by recommending great places', /* TODO: ko */
    contribution_mySuggestions: 'My Suggestions', /* TODO: ko */
    contribution_noSuggestions: 'No suggestions yet', /* TODO: ko */
    contribution_statusVoting: 'Voting', /* TODO: ko */
    contribution_statusApproved: 'Approved', /* TODO: ko */
    contribution_voteInfo: 'Reach Lv.7 to participate in community voting', /* TODO: ko */
    contribution_exclusionVotes: 'Exclusion Votes', /* TODO: ko */
    contribution_newPlaceReviews: 'New Place Reviews', /* TODO: ko */
    contribution_exclude: 'Exclude', /* TODO: ko */
    contribution_keep: 'Keep', /* TODO: ko */
    contribution_approve: 'Approve', /* TODO: ko */
    contribution_reject: 'Reject', /* TODO: ko */
    contribution_voteSuccess: 'Vote Submitted', /* TODO: ko */
    contribution_voteEarned: 'You earned {amount} coins', /* TODO: ko */
    contribution_voteFailed: 'Vote Failed', /* TODO: ko */
    contribution_voteTryAgain: 'Please try again', /* TODO: ko */
    contribution_noPendingVotes: 'No pending votes', /* TODO: ko */
    contribution_reasonClosed: 'Closed', /* TODO: ko */
    contribution_reasonRelocated: 'Relocated', /* TODO: ko */
    contribution_reasonWrongInfo: 'Wrong Info', /* TODO: ko */
    contribution_reasonOther: 'Other', /* TODO: ko */

    // ========== Itinerary ==========
    itinerary_addedToItinerary: 'Added to itinerary', /* TODO: ko */
    itinerary_removedFromItinerary: 'Removed from itinerary', /* TODO: ko */
    itinerary_aiUnavailable: 'Sorry, I cannot respond right now. Please try again later.', /* TODO: ko */
    itinerary_removed: 'Removed "{name}"', /* TODO: ko */
    itinerary_removeFailed: 'Failed to remove, please try again', /* TODO: ko */
    itinerary_addPlacesFailed: 'Failed to add places, please try again', /* TODO: ko */
    itinerary_reorderFailed: 'Reorder failed, please try again', /* TODO: ko */
    itinerary_incomplete: 'Incomplete', /* TODO: ko */
    itinerary_selectCountryCity: 'Please select country and city', /* TODO: ko */
    itinerary_createFailed: 'Create Failed', /* TODO: ko */
    itinerary_tryAgainLater: 'Please try again later', /* TODO: ko */
    itinerary_networkError: 'Network error, please try again later', /* TODO: ko */
    itinerary_updateFailed: 'Update failed', /* TODO: ko */
    itinerary_deleteItineraries: 'Delete Itineraries', /* TODO: ko */
    itinerary_deleteItinerariesConfirm: 'Are you sure you want to delete {count} itineraries? This cannot be undone.', /* TODO: ko */
    itinerary_deleteItinerary: 'Delete Itinerary', /* TODO: ko */
    itinerary_deleteItineraryConfirm: 'Are you sure you want to delete this itinerary? This cannot be undone.', /* TODO: ko */
    itinerary_deleted: 'Deleted {count} itineraries', /* TODO: ko */
    itinerary_deletedSingle: 'Itinerary deleted', /* TODO: ko */
    itinerary_deleteFailed: 'Delete failed', /* TODO: ko */
    itinerary_loginRequired: 'Login to use Trip Assistant', /* TODO: ko */
    itinerary_noItineraries: 'No itineraries yet', /* TODO: ko */
    itinerary_noItinerariesDesc: 'Your next adventure starts here', /* TODO: ko */
    itinerary_tipAi: 'AI recommends spots', /* TODO: ko */
    itinerary_tipPlanning: 'Auto daily planning', /* TODO: ko */
    itinerary_tipNav: 'Real-time navigation', /* TODO: ko */
    itinerary_createFirst: 'Create First Itinerary', /* TODO: ko */
    itinerary_openList: 'Open itinerary list', /* TODO: ko */
    itinerary_tripAssistant: 'Trip Assistant', /* TODO: ko */
    itinerary_viewDetails: 'View itinerary details', /* TODO: ko */
    itinerary_welcomeSubtitle: 'Tell me where you want to go', /* TODO: ko */
    itinerary_helpText: "Tell me your preferences, I'll recommend places\nTap top-left for trip list, top-right for itinerary", /* TODO: ko */
    itinerary_inputPlaceholder: 'Where do you want to go?', /* TODO: ko */
    itinerary_sendMessage: 'Send message', /* TODO: ko */
    itinerary_unknownPlace: '알 수 없는 장소', /* TODO: ko */
    itinerary_hereLocation: '여기', /* TODO: ko */
    itinerary_aiWelcome: '안녕! {city} 여행 어떻게 즐기고 싶어? 취향을 알려주면 일정을 짜줄게 ✨', /* TODO: ko */
    itinerary_myTrips: 'My Trips', /* TODO: ko */
    itinerary_tripsCount: 'trips', /* TODO: ko */
    itinerary_selectMode: 'Select', /* TODO: ko */
    itinerary_cancelSelect: 'Cancel selection', /* TODO: ko */
    itinerary_selectItineraries: 'Select itineraries', /* TODO: ko */
    itinerary_deleteSelected: 'Delete selected itineraries', /* TODO: ko */
    itinerary_deleteCount: 'Delete {count}', /* TODO: ko */
    itinerary_places: 'places', /* TODO: ko */
    itinerary_newTrip: 'New Trip', /* TODO: ko */
    itinerary_itinerary: 'Itinerary', /* TODO: ko */
    itinerary_viewOnGoogleMaps: 'View on Google Maps', /* TODO: ko */
    itinerary_addFromCollection: 'Add from Collection', /* TODO: ko */
    itinerary_noPlaces: 'No places yet\nChat with AI to add some!', /* TODO: ko */
    itinerary_addCount: 'Add ({count})', /* TODO: ko */
    itinerary_searchPlaces: 'Search places...', /* TODO: ko */
    itinerary_noMatchingPlaces: 'No matching places found', /* TODO: ko */
    itinerary_noCollectionPlaces: 'No places in collection\nGo gacha to collect some!', /* TODO: ko */
    itinerary_morePlaces: '{count} more places...', /* TODO: ko */
    itinerary_newItinerary: 'New Itinerary', /* TODO: ko */
    itinerary_tripTitle: 'Trip Title', /* TODO: ko */
    itinerary_tripTitlePlaceholder: 'Name your trip (optional)', /* TODO: ko */
    itinerary_date: 'Date', /* TODO: ko */
    itinerary_country: 'Country', /* TODO: ko */
    itinerary_countryPlaceholder: 'Country', /* TODO: ko */
    itinerary_city: 'City', /* TODO: ko */
    itinerary_cityPlaceholder: 'City', /* TODO: ko */
    itinerary_createItinerary: 'Create Itinerary', /* TODO: ko */
    // ========== Economy ==========
    economy_achievementsTitle: 'Achievements', /* TODO: ko */
    economy_loadFailed: 'Load Failed', /* TODO: ko */
    economy_loadFailedDesc: 'Unable to load economy data. Please try again later.', /* TODO: ko */
    economy_beginnerTasks: 'Beginner Tasks', /* TODO: ko */
    economy_done: 'done', /* TODO: ko */
    economy_achievementProgress: 'Achievement Progress', /* TODO: ko */
    economy_unlocked: 'unlocked', /* TODO: ko */
    economy_noAchievements: 'No achievements yet', /* TODO: ko */
    economy_myPerks: 'My Perks', /* TODO: ko */
    economy_dailyPullLimit: 'Daily Pull Limit', /* TODO: ko */
    economy_pullsPerDay: 'Number of pulls per day', /* TODO: ko */
    economy_inventorySlots: 'Inventory Slots', /* TODO: ko */
    economy_itemsCanHold: 'Number of items you can hold', /* TODO: ko */
    economy_specialistEligibility: 'Specialist Eligibility', /* TODO: ko */
    economy_canApplyNow: 'You can apply now!', /* TODO: ko */
    economy_unlockRequirement: 'Unlock by earning 1,500 coins and "Veteran Traveler" achievement', /* TODO: ko */
    economy_aboutCoins: 'About Coins', /* TODO: ko */
    economy_coinsInfo: 'Earn coins by completing tasks and unlocking achievements. Accumulate coins to unlock more perks!', /* TODO: ko */
    economy_statAchievements: 'Achievements', /* TODO: ko */
    economy_tabDaily: 'Daily', /* TODO: ko */
    economy_tabOnce: 'Once', /* TODO: ko */
    economy_tabTotal: 'Total', /* TODO: ko */
    economy_tabPerks: 'Perks', /* TODO: ko */
    economy_congratsCoupon: 'Congratulations!', /* TODO: ko */
    economy_shareTitle: 'Mibu Gacha Win!', /* TODO: ko */
    economy_shareCopied: 'Copied', /* TODO: ko */
    economy_share: 'Share', /* TODO: ko */
    economy_collect: 'Collect', /* TODO: ko */
    economy_claimed: 'Claimed', /* TODO: ko */
    economy_goDoIt: 'Go', /* TODO: ko */
    economy_locked: 'Locked', /* TODO: ko */
    economy_pendingClaims: 'Pending', /* TODO: ko */
    economy_claimSuccess: 'Reward claimed!', /* TODO: ko */
    economy_claimFailed: 'Claim failed', /* TODO: ko */
    economy_noQuests: 'No quests', /* TODO: ko */
    economy_questProgress: 'Quest Progress', /* TODO: ko */
    economy_couponExpiry: 'Exp: {month}/{day}', /* TODO: ko */
    economy_shareTextTemplate: '🎰 I got a【{tier}】coupon from Mibu Gacha!\n🎁 {couponName}\n📍 {placeName}\n\nCome play ➜ https://mibu.app', /* TODO: ko */
    favorites_title: 'My Favorites', /* TODO: ko */
    favorites_removeFavorite: 'Remove Favorite', /* TODO: ko */
    favorites_confirmRemove: 'Remove "{name}" from favorites?', /* TODO: ko */
    favorites_remove: 'Remove', /* TODO: ko */
    favorites_error: 'Error', /* TODO: ko */
    favorites_removeFailed: 'Failed to remove favorite', /* TODO: ko */
    favorites_addedAt: 'Added ', /* TODO: ko */
    favorites_totalCount: '{count} favorites', /* TODO: ko */
    favorites_noFavorites: 'No favorites yet', /* TODO: ko */
    favorites_tapToAdd: 'Tap the heart icon in your collection to add favorites', /* TODO: ko */
    collection_myCollection: 'My Collection', /* TODO: ko */
    collection_newPlaces: '{count} new places', /* TODO: ko */
    collection_collected: 'Collected', /* TODO: ko */
    collection_cities: 'Cities', /* TODO: ko */
    collection_categories: 'Categories', /* TODO: ko */
    collection_searchPlaceholder: 'Search places...', /* TODO: ko */
    collection_clearSearch: 'Clear search', /* TODO: ko */
    collection_resultsFound: '{count} results found', /* TODO: ko */
    collection_noMatching: 'No matching places', /* TODO: ko */
    collection_all: 'All', /* TODO: ko */
    collection_loadFailed: 'Failed to load collection', /* TODO: ko */
    collection_loadFailedDetail: 'Please check your connection and try again', /* TODO: ko */
    collection_pleaseLogin: 'Please Login', /* TODO: ko */
    collection_loginForFavorite: 'Login to use favorites', /* TODO: ko */
    collection_addedToFavorites: 'Added to Favorites', /* TODO: ko */
    collection_addedToFavoritesDesc: '{name} has been added to favorites', /* TODO: ko */
    collection_operationFailed: 'Failed', /* TODO: ko */
    collection_tryAgainLater: 'Please try again later', /* TODO: ko */
    collection_loginForBlacklist: 'Login to use blacklist', /* TODO: ko */
    collection_addToBlacklist: 'Add to Blacklist', /* TODO: ko */
    collection_confirmBlacklist: 'Are you sure you want to blacklist "{name}"?\nThis place will not appear in future gacha pulls.', /* TODO: ko */
    collection_addedToBlacklist: 'Added to Blacklist', /* TODO: ko */
    collection_addedToBlacklistDesc: '{name} has been blacklisted', /* TODO: ko */
    collection_addToFavorites: 'Add to favorites', /* TODO: ko */
    collection_closeDetails: 'Close details', /* TODO: ko */
    collection_viewOnMap: 'View on map', /* TODO: ko */
    gacha_startGachaExcl: 'Start Gacha!', /* TODO: ko */
    gacha_tierSP: 'SUPER RARE', /* TODO: ko */
    gacha_tierSSR: 'ULTRA RARE', /* TODO: ko */
    gacha_tierSR: 'RARE', /* TODO: ko */
    gacha_tierS: 'SPECIAL', /* TODO: ko */
    gacha_tierR: 'REGULAR', /* TODO: ko */
    gacha_rateLimited: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
    gacha_loginRequired: '로그인 필요',
    gacha_loginRequiredDesc: '가챠 기능을 사용하려면 로그인이 필요합니다',
    gacha_goToLogin: '로그인',
    gacha_noPlacesInArea: '이 지역에 장소가 없습니다. 다른 지역을 시도해 주세요.',
    gacha_generationFailed: '여행 일정 생성에 실패했습니다. 다시 시도해 주세요.',
    gacha_loadRegionsFailed: '지역 데이터를 불러오지 못했습니다',
    gacha_loadRegionsRetry: '네트워크 연결을 확인하고 다시 시도해 주세요',
    gacha_selectExploreRegion: '탐험 지역 선택',
    gacha_countryLabel: '국가',
    gacha_cityRegionLabel: '도시/지역',
    gacha_pullCountLabel: '가챠 횟수',
    gacha_dailyLimitInfo: '하루 최대 36회',
    gacha_pullUnit: '회',
    gacha_itemBoxFull: '보관함이 가득 찼습니다',
    gacha_itemBoxFullDesc: '먼저 아이템을 정리해 주세요',
    gacha_goTo: '이동',
    gacha_slotsRemaining: '{count}칸 남음',
    gacha_probabilityInfo: '확률 안내',
    gacha_rareCoupons: 'SP/SSR 레어 쿠폰',
    gacha_noRareCoupons: '이 지역에는 레어 쿠폰이 없습니다',
    // ---- Merchant 五大畫面遷移用 ----
    merchant_dashboard: 'Merchant Dashboard', /* TODO: ko */
    merchant_editPlace: 'Edit Place', /* TODO: ko */
    merchant_basicInfoReadonly: 'Basic Info (Read-only)', /* TODO: ko */
    merchant_location: 'Location', /* TODO: ko */
    merchant_editableInfo: 'Editable Info', /* TODO: ko */
    merchant_description: 'Description', /* TODO: ko */
    merchant_descriptionPlaceholder: 'Enter description...', /* TODO: ko */
    merchant_googleMapUrl: 'Google Map URL', /* TODO: ko */
    merchant_googleMapUrlPlaceholder: 'Paste Google Map URL', /* TODO: ko */
    merchant_openingHours: 'Opening Hours', /* TODO: ko */
    merchant_openingHoursPlaceholder: 'e.g., Mon-Fri 09:00-18:00', /* TODO: ko */
    merchant_openingHoursHint: 'One time slot per line', /* TODO: ko */
    merchant_promoSection: 'Promotion', /* TODO: ko */
    merchant_promoTitle: 'Promo Title', /* TODO: ko */
    merchant_promoTitlePlaceholder: 'e.g., 10% off for new customers', /* TODO: ko */
    merchant_promoDescription: 'Promo Description', /* TODO: ko */
    merchant_promoDescriptionPlaceholder: 'Enter promo details...', /* TODO: ko */
    merchant_enablePromo: 'Enable Promotion', /* TODO: ko */
    merchant_saving: 'Saving...', /* TODO: ko */
    merchant_dailyCode: "Today's Verification Code", /* TODO: ko */
    merchant_expiresAt: 'Valid until', /* TODO: ko */
    merchant_creditBalance: 'Credit Balance', /* TODO: ko */
    merchant_points: 'pts', /* TODO: ko */
    merchant_topUp: 'Top Up', /* TODO: ko */
    merchant_payStripe: 'Pay with Stripe', /* TODO: ko */
    merchant_payRecur: 'Pay with Recur', /* TODO: ko */
    merchant_purchaseCredits: 'Purchase Credits', /* TODO: ko */
    merchant_min100: 'Minimum 100 points', /* TODO: ko */
    merchant_demoCafe: 'Demo Cafe', /* TODO: ko */
    merchant_transactionCreated: 'Transaction created', /* TODO: ko */
    merchant_purchaseFailed: 'Purchase failed', /* TODO: ko */
    merchant_analyticsDesc: 'View statistics and insights', /* TODO: ko */
    merchant_storeManagement: 'Store Management', /* TODO: ko */
    merchant_storeManagementDesc: 'Manage your store info', /* TODO: ko */
    merchant_productManagementLabel: 'Product Management', /* TODO: ko */
    merchant_productManagementDesc: 'Manage products and services', /* TODO: ko */
    merchant_couponManagement: 'Coupon Management', /* TODO: ko */
    merchant_couponManagementDesc: 'Create and manage coupons', /* TODO: ko */
    merchant_merchantProfile: 'Merchant Profile', /* TODO: ko */
    merchant_merchantProfileDesc: 'Edit basic merchant info', /* TODO: ko */
    merchant_tierProbability: 'Draw Probability', /* TODO: ko */
    merchant_claimNew: 'Claim New Place', /* TODO: ko */
    merchant_loadPlacesFailed: 'Failed to load places', /* TODO: ko */
    merchant_checkConnection: 'Please check your connection and try again', /* TODO: ko */
    merchant_placeManagement: 'Place Management', /* TODO: ko */
    merchant_accountStatus: 'Account Status', /* TODO: ko */
    merchant_subscriptionPlan: 'Subscription Plan', /* TODO: ko */
    merchant_freePlan: 'Free Plan', /* TODO: ko */
    merchant_partnerPlan: 'Partner', /* TODO: ko */
    merchant_premiumPlan: 'Premium', /* TODO: ko */
    merchant_memberSince: 'Member Since', /* TODO: ko */
    merchant_dangerZone: 'Danger Zone', /* TODO: ko */
    merchant_confirmDeleteTitle: 'Confirm Delete Account', /* TODO: ko */
    merchant_confirmDeleteMessage: 'This action cannot be undone. All your data will be permanently deleted.', /* TODO: ko */
    merchant_confirmDeleteBtn: 'Confirm Delete', /* TODO: ko */
    merchant_deleteFailed: 'Delete failed, please try again later', /* TODO: ko */
    merchant_deleteAccount: 'Delete Account', /* TODO: ko */
    merchant_accountDeleted: 'Account deleted', /* TODO: ko */
    merchant_searchFailedRetry: 'Search failed, please try again', /* TODO: ko */
    merchant_validUntilWithFormat: 'Valid Until (YYYY-MM-DD)', /* TODO: ko */

    // ========== SettingsScreen ==========
    settings_title: '설정',
    settings_account: '계정',
    settings_profile: '프로필',
    settings_language: '언어',
    settings_about: '정보',
    settings_privacyPolicy: '개인정보 처리방침',
    settings_termsOfService: '이용약관',
    settings_helpCenter: '고객센터',
    settings_admin: '관리자',
    settings_globalExclusions: 'Global Exclusions', /* TODO: ko */
    settings_accountManagement: 'Account Management', /* TODO: ko */
    settings_logout: '로그아웃',
    settings_deleteAccount: '계정 삭제',
    settings_selectLanguage: '언어 선택',
    settings_confirmLogout: '로그아웃 확인',
    settings_confirmLogoutDesc: '로그아웃하시겠습니까?',
    settings_deleteAccountTitle: '계정 삭제',
    settings_deleteAccountDesc: 'Delete your account? This cannot be undone.', /* TODO: ko */
    settings_cannotDelete: 'Cannot Delete', /* TODO: ko */
    settings_deleteFailed: 'Delete failed, please try again', /* TODO: ko */
    settings_deactivateMerchantFirst: 'Please deactivate merchant account first', /* TODO: ko */
    settings_mergeAccounts: 'Merge Accounts', /* TODO: ko */
    settings_mergeAccountsDesc: 'Merge Accounts', /* TODO: ko */
    settings_continue: '계속',
    settings_loginSecondary: 'Login Secondary Account', /* TODO: ko */
    settings_loginSecondaryDesc: 'Login Secondary Account', /* TODO: ko */
    settings_loginToMerge: 'Login account to merge', /* TODO: ko */
    settings_merging: 'Merging...', /* TODO: ko */
    settings_mergingDesc: 'Please wait', /* TODO: ko */
    settings_mergeSuccess: 'Merge Successful!', /* TODO: ko */
    settings_mergeFailed: 'Merge Failed', /* TODO: ko */
    settings_mergeFailedRetry: 'Merge failed', /* TODO: ko */
    settings_mergedData: 'Merged data:', /* TODO: ko */
    settings_collections: '도감',
    settings_itineraries: '일정',
    settings_favorites: '즐겨찾기',
    settings_achievements: '업적',
    settings_preferences: '환경설정',
    settings_favoritesBlacklist: '즐겨찾기 / 차단목록',
    settings_pushNotifications: '푸시 알림',
    settings_moreFeatures: '추가 기능',
    settings_contributions: '커뮤니티 기여',
    settings_openSystemSettings: '설정 열기',
    settings_coins: '코인',
    settings_balance: '잔액',
    settings_unknownError: 'An unknown error occurred', /* TODO: ko */
    settings_pleaseLoginFirst: 'Please login first', /* TODO: ko */
    settings_notificationPreferences: '알림 설정',

    // ========== NotificationPreferencesScreen ==========
    notifPref_title: '알림 설정',
    notifPref_categoryTitle: '알림 유형',
    notifPref_achievement: '업적 달성',
    notifPref_achievementDesc: '새로운 업적 달성 시 알림',
    notifPref_dailyTask: '일일 퀘스트',
    notifPref_dailyTaskDesc: '퀘스트 완료 또는 리셋 시 알림',
    notifPref_coupon: '쿠폰',
    notifPref_couponDesc: '새 쿠폰 수신 시 알림',
    notifPref_announcement: '시스템 공지',
    notifPref_announcementDesc: '공식 공지 및 중요 알림',
    notifPref_quietHoursTitle: '방해 금지',
    notifPref_quietHoursDesc: '방해 금지 시간에는 푸시 알림이 오지 않습니다 (기록은 남습니다)',
    notifPref_quietHoursStart: '시작 시간',
    notifPref_quietHoursEnd: '종료 시간',
    notifPref_loadFailed: '설정 로드 실패',
    notifPref_saveFailed: '저장 실패, 나중에 다시 시도해 주세요',
    notifPref_saveSuccess: '알림 설정이 업데이트되었습니다',

    // ========== NotificationListScreen ==========
    notifList_title: '알림',
    notifList_empty: '알림이 없습니다',
    notifList_emptyDesc: '새로운 알림이 여기에 표시됩니다',
    notifList_markAllRead: '모두 읽음',
    notifList_loadFailed: '알림 로드 실패',
    notifList_achievementUnlocked: '업적 달성',
    notifList_dailyTaskCompleted: '퀘스트 완료',
    notifList_newCoupon: '새 쿠폰',
    notifList_announcementLabel: '시스템 공지',

    // ========== ProfileScreen ==========
    profile_title: '프로필',
    profile_save: '저장',
    profile_uploading: '업로드 중...',
    profile_tapToChange: '탭하여 아바타 변경',
    profile_userId: '사용자 ID',
    profile_enterEmail: 'Enter email', /* TODO: ko */
    profile_lastName: '성',
    profile_firstName: '이름',
    profile_enterLastName: 'Enter last name', /* TODO: ko */
    profile_enterFirstName: 'Enter first name', /* TODO: ko */
    profile_gender: '성별',
    profile_select: '선택',
    profile_birthDate: '생년월일',
    profile_phone: '전화번호',
    profile_enterPhone: 'Enter phone number', /* TODO: ko */
    profile_dietaryRestrictions: '식이 제한',
    profile_dietaryPlaceholder: 'e.g., Vegetarian, Seafood allergy', /* TODO: ko */
    profile_medicalHistory: '병력',
    profile_medicalPlaceholder: 'e.g., Diabetes, Hypertension', /* TODO: ko */
    profile_emergencyContact: '긴급 연락처',
    profile_contactName: '이름',
    profile_enterName: 'Enter name', /* TODO: ko */
    profile_contactPhone: '전화',
    profile_enterContactPhone: 'Enter phone', /* TODO: ko */
    profile_relationship: '관계',
    profile_chooseAvatar: '아바타 선택',
    profile_uploadAvatar: 'Upload Custom Avatar', /* TODO: ko */
    profile_profileUpdated: 'Profile updated', /* TODO: ko */
    profile_saveFailed: 'Failed to save', /* TODO: ko */
    profile_loadFailed: 'Failed to load profile', /* TODO: ko */
    profile_photoPermissionRequired: 'Photo library permission required', /* TODO: ko */
    profile_cannotReadImage: 'Cannot read image data', /* TODO: ko */
    profile_avatarUploaded: 'Avatar uploaded', /* TODO: ko */
    profile_uploadFailed: 'Upload failed', /* TODO: ko */
    profile_uploadFailedRetry: 'Upload failed, please try again', /* TODO: ko */
    profile_previewAvatar: '아바타 미리보기',
    profile_previewConfirm: '사용하기',
    profile_previewCancel: '다시 선택',
    profile_genderMale: '남성',
    profile_genderFemale: '여성',
    profile_genderOther: '기타',
    profile_relationSpouse: '배우자',
    profile_relationParent: '부모',
    profile_relationSibling: '형제자매',
    profile_relationFriend: '친구',
    profile_relationOther: '기타',

    // AccountScreen 帳號綁定翻譯已移除

    // ========== HomeScreen ==========
    home_greeting: '안녕하세요, 여행자!',
    home_greetingSubtitle: '오늘은 어디를 탐험하시겠어요?',
    home_newsTab: '공지',
    home_localTab: '로컬',
    home_flashTab: '플래시',
    home_noAnnouncements: '공지사항이 없습니다',
    home_stayTuned: '새 소식을 기대해주세요!',
    home_noLocalActivities: 'No local activities', /* TODO: ko */
    home_discoverNearby: 'Discover events near you!', /* TODO: ko */
    home_noFlashEvents: 'No flash events', /* TODO: ko */
    home_limitedOffersSoon: 'Limited offers coming soon!', /* TODO: ko */
    home_loginStreak: '연속 로그인',
    home_days: '일',
    home_specialistReady: 'Specialist Ready', /* TODO: ko */
    home_dailyTasks: '일일 과제',
    home_done: '완료',
    home_earned: '획득',
    home_coinsUnit: '코인',
    home_titleLegendary: 'Legendary', /* TODO: ko */
    home_titleExpert: 'Expert', /* TODO: ko */
    home_titleTraveler: 'Traveler', /* TODO: ko */
    home_titleExplorer: 'Explorer', /* TODO: ko */
    home_titleNewbie: 'Newbie', /* TODO: ko */

    // ========== Mailbox (#045) ==========
    mailbox_title: 'Inbox', /* TODO: ko */
    mailbox_empty: 'No mail yet', /* TODO: ko */
    mailbox_emptyDesc: 'System rewards and promo code prizes will appear here', /* TODO: ko */
    mailbox_tabUnclaimed: 'Unclaimed', /* TODO: ko */
    mailbox_tabClaimed: 'Claimed', /* TODO: ko */
    mailbox_tabExpired: 'Expired', /* TODO: ko */
    mailbox_claim: 'Claim', /* TODO: ko */
    mailbox_claimAll: 'Claim All', /* TODO: ko */
    mailbox_claimSuccess: 'Claimed!', /* TODO: ko */
    mailbox_claimFailed: 'Claim failed', /* TODO: ko */
    mailbox_claimPartial: 'Some rewards failed to claim', /* TODO: ko */
    mailbox_claimAllSuccess: 'Claimed {count} items', /* TODO: ko */
    mailbox_claimAllFailed: 'Partial failure ({success} claimed, {failed} failed)', /* TODO: ko */
    mailbox_loadFailed: 'Load failed', /* TODO: ko */
    mailbox_loadFailedDesc: 'Unable to load inbox. Please try again later', /* TODO: ko */
    mailbox_rewards: 'Rewards', /* TODO: ko */
    mailbox_source: 'Source', /* TODO: ko */
    mailbox_sourcePromo: 'Promo Code', /* TODO: ko */
    mailbox_sourceAdmin: 'System Notice', /* TODO: ko */
    mailbox_sourceSystem: 'System Reward', /* TODO: ko */
    mailbox_sourceEvent: 'Event Reward', /* TODO: ko */
    mailbox_expiresAt: 'Expires {date}', /* TODO: ko */
    mailbox_expired: 'Expired', /* TODO: ko */
    mailbox_claimed: 'Claimed', /* TODO: ko */
    mailbox_promoCode: 'Promo Code', /* TODO: ko */
    mailbox_promoPlaceholder: 'Enter promo code', /* TODO: ko */
    mailbox_promoRedeem: 'Redeem', /* TODO: ko */
    mailbox_promoSuccess: 'Redeemed! Rewards added to inbox', /* TODO: ko */
    mailbox_promoFailed: 'Redeem failed', /* TODO: ko */
    mailbox_promoEmpty: 'Please enter a promo code', /* TODO: ko */
    mailbox_rewardCoins: '{amount} coins', /* TODO: ko */
    mailbox_rewardItem: 'Shop item', /* TODO: ko */
    mailbox_rewardCoupon: 'Coupon', /* TODO: ko */
    mailbox_rewardPlacePack: 'Place pack', /* TODO: ko */
    mailbox_rewardPerk: 'Perk', /* TODO: ko */
    mailbox_unreadCount: '{count}개 읽지 않음', /* TODO: ko */

    // ========== ItemBox 아이템 상자 ==========
    itemBox_title: '아이템 상자',
    itemBox_loading: '로딩 중...',
    itemBox_loadFailed: '로드 실패',
    itemBox_loadFailedDesc: '아이템을 불러오지 못했습니다. 나중에 다시 시도해주세요.',
    itemBox_full: '아이템 상자가 가득 찼습니다! 쿠폰을 삭제하거나 사용한 후 뽑기를 해주세요.',
    itemBox_almostFull: '아이템 상자가 거의 가득 찼습니다, {remaining}칸 남음',
    itemBox_slotExpired: '만료',
    itemBox_slotUsed: '사용됨',
    itemBox_expired: '만료됨',
    itemBox_validUntil: '{date}까지 유효',
    itemBox_close: '닫기',
    itemBox_redeem: '사용하기',
    itemBox_redeemTitle: '쿠폰 사용',
    itemBox_redeemInputLabel: '매장 인증 코드 입력',
    itemBox_redeemPlaceholder: '8자리 코드',
    itemBox_redeemConfirm: '사용 확인',
    itemBox_redeemSuccess: '사용 완료!',
    itemBox_redeemShowMerchant: '이 화면을 매장 직원에게 보여주세요',
    itemBox_redeemCountdown: '카운트다운',
    itemBox_redeemDone: '완료',
    itemBox_redeemNotice: '알림',
    itemBox_redeemEnterCode: '매장 인증 코드를 입력해주세요',
    itemBox_redeemFailed: '사용 실패',
    itemBox_redeemInvalidCode: '잘못된 코드',
    itemBox_redeemInvalidCodeDesc: '매장에서 제공한 코드를 확인해주세요',
    itemBox_redeemExpired: '이 쿠폰은 만료되었습니다',
    itemBox_redeemAlreadyUsed: '이미 사용됨',
    itemBox_redeemAlreadyUsedDesc: '이 쿠폰은 이미 사용되었습니다',
    itemBox_redeemError: '사용에 실패했습니다. 나중에 다시 시도해주세요.',
    itemBox_deleteTitle: '삭제하시겠습니까?',
    itemBox_deleteDesc: '이 작업은 되돌릴 수 없습니다',
    itemBox_deleteCancel: '취소',
    itemBox_deleteConfirm: '삭제',
    itemBox_deleteFailed: '삭제 실패',
    itemBox_error: '오류',
    itemBox_packOpenTitle: '장소 팩 열기',
    itemBox_packOpenConfirm: '"{name}"을(를) 여시겠습니까?\n{city}의 장소 {count}개를 획득합니다',
    itemBox_packOpen: '열기',
    itemBox_packOpenSuccess: '열기 완료',
    itemBox_packOpenResult: '장소가 도감에 추가되었습니다',
    itemBox_packOpenFailed: '열기 실패, 나중에 다시 시도해주세요',
    itemBox_packSelectCity: '도시 선택',
    itemBox_packPlaces: '개 장소',
    itemBox_packOpening: '여는 중...',
};

export default ko;
