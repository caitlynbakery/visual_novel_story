import 'dart:async';

import 'package:flame/components.dart';
import 'package:flame/game.dart';
import 'package:flame/input.dart';
import 'package:flutter/material.dart';
import 'package:jenny/jenny.dart';
import 'package:jenny_visual_novel/main.dart';

class ProjectViewComponent extends PositionComponent
    with DialogueView, HasGameRef<JennyGame> {
  late final TextBoxComponent mainDialogueTextComponent;
  final dialoguePaint = TextPaint(
      style: const TextStyle(
          backgroundColor: Color.fromARGB(160, 158, 158, 158), fontSize: 26));
  final background = SpriteComponent();
  final girl = SpriteComponent();
  final boy = SpriteComponent();
  late final ButtonComponent forwardButtonComponent;
  Completer<void> _forwardCompleter = Completer();
  Completer<int> _choiceCompleter = Completer<int>();
  List<ButtonComponent> optionsList = [];

  @override
  FutureOr<void> onLoad() {
    background
      ..sprite = gameRef.trainBackgroundSprite
      ..size = gameRef.size;
    girl
      ..sprite = gameRef.girlSprite
      ..anchor = Anchor.bottomCenter
      ..position = Vector2(gameRef.size.x * 0.2, gameRef.size.y)
      ..size = Vector2(1011, 1145) * 0.4;
    boy
      ..sprite = gameRef.boySprite
      ..anchor = Anchor.bottomCenter
      ..position = Vector2(gameRef.size.x * 0.8, gameRef.size.y)
      ..size = Vector2(1011, 1145) * 0.4;

    forwardButtonComponent = ButtonComponent(
        button: PositionComponent(),
        size: gameRef.size,
        onPressed: () {
          if (!_forwardCompleter.isCompleted) {
            _forwardCompleter.complete();
          }
        });
    mainDialogueTextComponent = TextBoxComponent(
        textRenderer: dialoguePaint,
        text:
            'Press next on the screen to begin the story and the story will start!',
        position: Vector2(50, gameRef.size.y * 0.8),
        boxConfig: TextBoxConfig(maxWidth: gameRef.size.x * 0.8));
    addAll([
      background,
      girl,
      boy,
      forwardButtonComponent,
      mainDialogueTextComponent
    ]);
    return super.onLoad();
  }

  @override
  FutureOr<bool> onLineStart(DialogueLine line) async {
    _forwardCompleter = Completer();
    await _advance(line);
    return super.onLineStart(line);
  }

  @override
  FutureOr<int?> onChoiceStart(DialogueChoice choice) async {
    _choiceCompleter = Completer<int>();
    forwardButtonComponent.removeFromParent();
    mainDialogueTextComponent.text = 'make your choice';
    for (int i = 0; i < choice.options.length; i++) {
      optionsList.add(ButtonComponent(
          position: Vector2(30, i * 50 + 50),
          button: TextComponent(
              text: 'Choice ${i + 1}: ${choice.options[i].text}')));
    }
    addAll(optionsList);
    await _getChoice(choice);
    return _choiceCompleter.future;
  }

  Future<void> _getChoice(DialogueChoice choice) async {
    return _forwardCompleter.future;
  }

  Future<void> _advance(DialogueLine line) async {
    var characterName = line.character?.name ?? '';
    var dialogueLineText = '$characterName: ${line.text}';
    mainDialogueTextComponent.text = dialogueLineText;
    debugPrint('debug: $dialogueLineText');
    return _forwardCompleter.future;
  }
}
