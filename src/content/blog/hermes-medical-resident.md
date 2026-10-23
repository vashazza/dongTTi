---
title: "Training Like a Medical Resident: Context-Prior Learning Toward Universal Medical Image Segmentation"
subtitle: "특정 모달리티에 국한되지 않고 범용적으로 사용할 수 있는 모델"
date: 2025-11-15
category: paper
readMinutes: 7
---
### 선정 이유

앞선 논문의 레퍼런스를 검색하다가 발견한 논문인데, 특정 모달리티에 국한되지 않고 범용적으로 사용할 수 있는 모델이 의료영상처리 분야에서 달성해야 할 목표 중 하나라고 생각해서 읽어봤다.

### Background

현재까지는 주로 특정 object나 modality에 따른 개별 모델 개발을 장려해옴. 그러나, 이러한 패러다임은 동일한 도메인에서의 제한된 학습 데이터로 인해 모델의 일반화 성능이 저하됨.

-> 저자는 이러한 접근법이 medical segmentation model의 capability와 scalability를 제한하고 있다고 봄!

radiology 레지던트 프로그램: 의사의 전문성은 다양한 이미지를 일상적으로 접하면서 형성됨 + 인체는 해부학적 다양성을 보이지만, 이러한 구조는 이미지에서 통계적으로 유사한 모습을 자주 나타냄. 즉, 인체는 서로 다른 모달리티에서 특정 패턴으로 나타나며, 훈련 과정에서 레지던트들은 이 패턴을 해석하기 위해 ROI(관심 영역)에 대한 사전 지식을 공부하는 것.

  → 그래서 저자는 비슷한 방법을 통해 universal medical image segmentation으로의 패러다임 전환을 하려 함. 이 과정에서 의문이 생김.

1) 서로 다른 ROI를 가진 segmentation이 서로에게 이익을 줄 수 있는가?
2) feature representation이 서로 다른 신체 부위 간에 transfer 가능한가?
3) 시각적 차이에도 불구하고 의미 있는 공통점을 식별 가능한가?

### Related Works

1) Partially Labeled Data 문제
   특정 임상 목적에 맞춰 구축되기 때문에 특정 부분에만 annotation 된 경우가 많음.
   이를 해결하기 위해 이전까지는...

 - label-conditioned learning: 특정 label 주어질 때만 학습 진행
 - organ size distribution regularization: 장기의 크기 분포 정규화해서 여러 데이터셋 병합
 - pseudo labeling for co-training: 여러 데이터셋 종합하여 다중 장기 정보 학습하도록
 - DoDNet: one-hot encoding한 label 사용
 - CLIP-Driven Universal Model: text embedding으로 task 정보 제공
 - multitalent: 여러 개의 head로 보편적 학습 수행
 - UniSeg: task prompt 사용하지만, modality 정보 고려하지 않음.

  → 본 연구의 HERMES는 context-prior learning을 통해 직접 의료데이터에서 task, modality 정보 획득하며, 다양한 task간 관계 학습하는 것이 차별점!

2) Prior Knowledge 활용
   anatomical structure와 영상 형식 특성을 반영하는 사전 지식이 중요한 역할을 한다.
   이를 활용하기 위해 이전까지는...

 - Atlas-based technique: 미리 정의된 atlas 활용.
 - statistical chape model: 전형적 형태르르 통계적으로 학습하여 활용.
 - graph-based models: 해부학적 관계를 그래프로 학습
 - shape prior via autoencoder: 사전에 모양 학습

  → 이러한 사전 지식의 개념을 "context prior" 형태로 직접 학습하여 활용

3) Universal Image Segmentation
   3D 의료 영상에서는 힘듦. 왜? 1) 동일한 object가 한 영상에 여러 개 존재하는 게 드물고, 2) fully annotated dataset이 거의 없음.

### Purpose

이전 연구에서 제기된 의료 영상 처리 분야의 문제점을 답습하지 않도록 universal medical image segmentation paradigm을 새롭게 제안하며, 다양한 ROI를 포함하는 단일 통합 모델 Hermes를 개발한다. 더 나아가, transfer learning, incremental learning 실험을 통해 새로운 데이터에도 통합 모델의 효과적인 적용이 가능함을 보여준다.

## Summary

### Method

서로 다른 데이터셋을 하나의 모델에서 학습하려 하면 1) annotation 차이, 2) class definition conflicts, 3) modality 차이가 발생함. 

![](https://velog.velcdn.com/images/vashazza/post/62921da4-6ce3-4f24-bd16-42320ba1ced2/image.png)


Hermes는 task와 modality 정보를 활용하여 context prior pool을 학습.

1) Context prior pool
   - Task prior
     - 각 task에 대한 사전 지식 학습
     - 모든 task를 binary segmentation으로 변환하여 학습
       +) 왜? partially labeled data 문제 해결하기 위해.
       예를 들어, 데이터셋 1: liver vs 배경, 데이터셋 2: liver vs 배경, tumor vs 배경
       이런 식으로 그 구조만 학습하도록 유도 -> 각 데이터셋마다 다르게 annotation된 데이터 통합 가능
  - Modality prior
    - 서로 다른 modality(CT, MRI, PET...)가 갖는 특징 학습.
2) Context prior selection & fusion
   적절한 prior 선택해 MLP 통해 결합.
   
- Oracle-guided context prior learning
  의학 레지던트의 훈련 방식에서 영감을 받아 영상 내 task 및 modality 정보를 oracle로 삼아 모델 학습을 유도함. Backbone과 결합하여 학습하는 방식으로, 기존의 task별 모델과 다르게 다양한 segmentation을 하나의 모델에서 수행할 수 있도록 함.

### Experiment

데이터셋

![](https://velog.velcdn.com/images/vashazza/post/1fb6a527-33e8-410b-a6ce-456c34786496/image.png)

11개의 데이터셋(총 2,438개의 3D 영상)에서 학습을 진행, 5가지 modality(CT, PET, T1 MRI, T2 MRI, Cine MRI)를 포함함. 다양한 신체 부위에서 organ, tumor, lesion segmentation 수행. 

  +) 대부분의 데이터셋은 완전한 annotation이 없고, 특정 장기, 병변에만 달려있다. -> HERMES가 이런 부분적으로 annotate된 데이터셋을 어떻게 활용하는지 검증하는 것이 포인트.

결과

![](https://velog.velcdn.com/images/vashazza/post/6fd23871-8b28-4f2c-9b42-776d42851203/image.png)

기존 모델의 경우 각 데이터셋에 대해 개별적으로 모델을 학습했다. 반면, HERMES는 하나의 통합된 모델로 모든 task를 수행할 수 있도록 했는데(Table 2에서 Hermes-R과 Hermes-M은 각각 ResNet, Medformer backbone으로 구분됨. 대조군 traditional model과 정확한 비교 위해 비슷한 구조 사용.), 그럼에도 불구하고 전반적으로 HERMES 모델이 기존 방식보다 일관되게 높은 성능을 보였다! 특히, Tumor과 Lesion segmentation(AutoPET)에서 기존 모델보다 약 8% 높은 Dice score를 기록했다. 

![](https://velog.velcdn.com/images/vashazza/post/5d83deff-8db9-4c18-9e97-6a5970d4dd93/image.png)

Downstream Tasks

- Transfer learning 실험
  새로운 데이터셋에서도 효과적인지 확인하기 위해 MSD 췌장 및 종양 데이터셋을 활용하여 실험 진행. 

![](https://velog.velcdn.com/images/vashazza/post/5db04180-32d8-4299-a695-e34af7636c7e/image.png)

  학습 데이터를 1%, 10%, 50%, 100%로 나눠 실험한 결과, 기존의 ResUNet은 데이터가 많을 때는 괜찮지만, 데이터가 적을 때 성능이 급격히 감소함. 반면, Hermes는 적은 데이터에서도 기존 모델보다 높은 성능을 유지. 특히, 1% 데이터만 사용했을 때도 기존 ResUNet 대비 성능이 10-15% 더 높음 

  → 데이터가 부족한 상황에서도 좋은 일반화 성능.
다른 모델과 비교해봐도, pancreas segmentation은 엇비슷한 성능을 보인다고 해도 tumor의 경우 10%에서 큰 차이로 최대 성능을 달성함! 
→ Hermes 모델은 transfer learning에 강하며, 새로운 소량의 데이터로도 좋은 성능을 발휘할 수 있음.

- Incremental learning 실험
  기존 모델의 문제점 중 하나는 새로운 task가 주어질 때 기존 지식을 잃어버리는 catastrophic forgetting이 발생한다는 것. 따라서, 초기에 특정 데이터셋으로 학습한 후 새로운 데이터셋을 추가 학습했을 때 기존 데이터셋에서의 성능이 얼마나 유지되는지 평가해봄. 

### Key point

1) Universal Medical Image Segmentation Paradigm 제안.

2) Context-Prior Learning Approach 개발.

  Task Prior → 각 task 에 대해 learnable token을 사용하여 관계를 모델링.
Modality Prior → 모달리티별로 prior token을 부여하여 modality 간 관계성을 모델이 학습.

3) Backbone에 쉽게 적용 가능.

4) 전통적인 single-task 모델보다 일관되게 더 높은 성능을 보임. Dice score 기준 평균 2~3% 향상됨.

## Overall...

### Limitations and Suggestions

- 논문에서 언급했듯 부분적으로 annotate된 데이터셋을 활용하므로 모델 성능이 영향을 받을 가능성이 있고, 이를 해결하기 위해 self-supervised learning이나 semi-supervised learning의 도입이 필요할 것이라고 제안함.

- 더 많은 종류의 의료 영상 사전 지식을 모델에 통합하는 것이 그 취지에 맞고, 연구의 중요한 과제가 될 것이나, 역시 catastrophic forgetting의 문제가 발생할 수 있음.

- 다양한 모달리티에 보편적으로 사용하기 위한 모델이다 보니 정확도 자체는 올라갈 수 있으나 소수 불균형 클래스에 대해서는 검증되어지지 않았다.

### Personal Insight

- 데이터가 부족한 환경에서도 성능을 유지하는 점은 각 병원마다 약간씩 달라지는 데이터에 쉽게 적용할 수 있으므로 큰 장점이 될 것이다. 

- 각 task에 맞춘 모델을 따로 학습시키지 않고, 레지던트가 학습하는 방식으로 사람처럼 여러 task를 한 모델이 할 수 있게 제안한 점이 인상적이다. 특히 무슨 task인지, 어떤 modality인지를 먼저 파악하고 segmentation을 시작하는 것이 사람의 생각 구조와 비슷하여 흥미롭다.
