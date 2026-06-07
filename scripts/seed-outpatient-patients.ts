import 'dotenv/config';
import { prisma } from '../lib/db';

const outpatientPatients = [
  {
    patientCode: 'P010',
    name: '田中 恵子',
    nameKana: 'タナカ ケイコ',
    gender: '女',
    dateOfBirth: '1981-04-15',
    age: 45,
    medicalRecordNumber: 'MR010',
    phone: '03-2345-6789',
    address: '東京都新宿区2-3-4',
    bloodType: 'B型',
    allergies: [] as string[],
    conditions: ['高血圧症', '脂質異常症'],
    height: 158,
    weight: 55,
    bmi: 22.0,
    department: '内科',
    status: '外来',
    chiefComplaint: '定期受診（高血圧・脂質異常症管理）',
    outpatientAttendingPhysician: '田中 医師',
    visits: [
      {
        visitId: 'v_p010_1',
        date: '2026-01-15',
        department: '内科',
        type: '外来',
        diagnosis: '高血圧症、脂質異常症',
        physician: '田中 医師',
        notes: '初診。血圧管理目的。',
      },
      {
        visitId: 'v_p010_2',
        date: '2026-03-15',
        department: '内科',
        type: '外来',
        diagnosis: '高血圧症、脂質異常症',
        physician: '田中 医師',
        notes: '再診。血圧コントロール良好。',
      },
    ],
    medicalRecords: [
      {
        recordId: 'mr_p010_1',
        date: '2026-01-15',
        type: '初診',
        visitType: '外来',
        progressNote:
          'S) 職場健診で高血圧・高脂血症を指摘され受診。自覚症状なし。\nO) BP 148/88, HR 74, BMI 22.0\nA) 高血圧症（Grade I）、脂質異常症\nP) 生活習慣指導。アムロジピン5mg開始。スタチン系検討。',
        physician: '田中 医師',
      },
      {
        recordId: 'mr_p010_2',
        date: '2026-03-15',
        type: '再診',
        visitType: '外来',
        progressNote:
          'S) 副作用なし。自宅血圧は130台で安定。\nO) BP 132/82, HR 70\nA) 高血圧症（コントロール良好）、脂質異常症\nP) 現処方継続。次回3ヶ月後。',
        physician: '田中 医師',
      },
    ],
  },
  {
    patientCode: 'P011',
    name: '中村 健一',
    nameKana: 'ナカムラ ケンイチ',
    gender: '男',
    dateOfBirth: '1968-09-22',
    age: 58,
    medicalRecordNumber: 'MR011',
    phone: '03-3456-7890',
    address: '東京都世田谷区5-6-7',
    bloodType: 'O型',
    allergies: [] as string[],
    conditions: ['腰部脊柱管狭窄症'],
    height: 172,
    weight: 78,
    bmi: 26.4,
    department: '整形外科',
    status: '外来',
    chiefComplaint: '腰痛・下肢しびれ（間欠性跛行）',
    outpatientAttendingPhysician: '山本 医師',
    visits: [
      {
        visitId: 'v_p011_1',
        date: '2026-02-10',
        department: '整形外科',
        type: '外来',
        diagnosis: '腰部脊柱管狭窄症',
        physician: '山本 医師',
        notes: '初診。腰痛・歩行時の下肢しびれを主訴。',
      },
      {
        visitId: 'v_p011_2',
        date: '2026-04-10',
        department: '整形外科',
        type: '外来',
        diagnosis: '腰部脊柱管狭窄症',
        physician: '山本 医師',
        notes: '再診。リハビリ継続。症状改善傾向。',
      },
    ],
    medicalRecords: [
      {
        recordId: 'mr_p011_1',
        date: '2026-02-10',
        type: '初診',
        visitType: '外来',
        progressNote:
          'S) 1年前から腰痛あり。最近、歩行100m程度で両下肢にしびれが出現し休憩要。\nO) SLR(-), 深部腱反射異常なし。MRI: L4/5腰部脊柱管狭窄。\nA) 腰部脊柱管狭窄症（間欠性跛行）\nP) 保存療法。NSAIDs処方。理学療法紹介。',
        physician: '山本 医師',
      },
      {
        recordId: 'mr_p011_2',
        date: '2026-04-10',
        type: '再診',
        visitType: '外来',
        progressNote:
          'S) リハビリ週2回継続中。歩行距離が200m程度まで改善。\nO) 神経学的所見変化なし。\nA) 腰部脊柱管狭窄症（改善傾向）\nP) リハビリ継続。症状増悪時は手術適応再検討。次回2ヶ月後。',
        physician: '山本 医師',
      },
    ],
  },
];

async function main() {
  for (const p of outpatientPatients) {
    const existing = await prisma.patient.findUnique({ where: { patientCode: p.patientCode } });
    if (existing) {
      console.log(`Skipped ${p.name} (${p.patientCode}): already exists`);
      continue;
    }

    const { visits, medicalRecords, ...patientData } = p;

    await prisma.patient.create({
      data: {
        ...patientData,
        visits: { create: visits },
        medicalRecords: { create: medicalRecords },
      },
    });
    console.log(`Created ${p.name} (${p.patientCode})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
