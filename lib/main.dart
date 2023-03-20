import 'package:flame/components.dart';
import 'package:flame/game.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:jenny/jenny.dart';
import 'package:jenny_visual_novel/project_view_component.dart';

void main() {
  runApp(GameWidget(game: JennyGame()));
}

class JennyGame extends FlameGame with HasTappables {
  late Sprite trainBackgroundSprite;
  late Sprite cafeBackgroundSprite;
  late Sprite apartmentBackgroundSprite;
  late Sprite girlSprite;
  late Sprite boySprite;
  YarnProject yarnProject = YarnProject();
  ProjectViewComponent projectViewComponent = ProjectViewComponent();

  @override
  Future<void> onLoad() async {
    trainBackgroundSprite = await loadSprite('train.png');
    cafeBackgroundSprite = await loadSprite('cafe.png');
    apartmentBackgroundSprite = await loadSprite('apartment.png');
    girlSprite = await loadSprite('girl.png');
    boySprite = await loadSprite('guy.png');

    String startDialogueData =
        await rootBundle.loadString('assets/yarn/start.yarn');
    String cafeData = await rootBundle.loadString('assets/yarn/cafe.yarn');
    yarnProject
      ..parse(startDialogueData)
      ..parse(cafeData);

    var dialogueRunner = DialogueRunner(
        yarnProject: yarnProject, dialogueViews: [projectViewComponent]);

    dialogueRunner.startDialogue('Train_Meeting');
    add(projectViewComponent);

    return super.onLoad();
  }
}
