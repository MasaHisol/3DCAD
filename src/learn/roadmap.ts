// The learning path from 2D drafting to design, shared by the learning center and the textbook.

export interface RoadmapStage {
  step: number;
  title: string;
  goal: string;
  /** In-app course chapters (curriculum ids) and textbook parts. */
  chapters: string[];
  textbook: string[];
}

export const ROADMAP: RoadmapStage[] = [
  { step: 1, title: "2D 作図", goal: "座標・基本図形・トリム・拘束・寸法で正確に描ける", chapters: ["drafting2d", "drafting2d-mid"], textbook: ["cad2d"] },
  { step: 2, title: "3D モデリング基礎", goal: "スケッチから押し出し・回転・穴・フィレット・パターンで部品を作れる", chapters: ["basics", "sketch", "features", "param", "modeling-plus"], textbook: ["cad3d", "basics"] },
  { step: 3, title: "組立と図面", goal: "部品を組み立て、JIS に沿った図面を作れる", chapters: ["assembly", "drawing", "drawing-pro", "drawing-practice"], textbook: ["drafting"] },
  { step: 4, title: "検証と製造", goal: "強度を確かめ、作り方を考えて製造データを渡せる", chapters: ["verify", "review-quality"], textbook: ["mechanics", "knowhow", "service"] },
  { step: 5, title: "応用設計", goal: "機械要素・駆動・デザインを考えて製品を設計できる", chapters: ["advanced", "sheetmetal-plus", "expert"], textbook: ["elements", "mechatronics", "design", "ux"] },
  { step: 6, title: "総合プロジェクト", goal: "要求仕様から製造データまで、1 つの装置を通しで設計できる", chapters: ["project-conveyor"], textbook: ["knowhow"] },
];
