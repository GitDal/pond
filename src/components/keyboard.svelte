<script lang="ts">
    interface Props {
        isUpPressed?: boolean;
        isLeftPressed?: boolean;
        isDownPressed?: boolean;
        isRightPressed?: boolean;
    }
    let { isUpPressed, isLeftPressed, isDownPressed, isRightPressed }: Props =
        $props();
</script>

<div class="keyboard-container">
    <div>
        <div class="key" class:pressed={isUpPressed}></div>
    </div>
    <div class="keyboard-row">
        <div class="key" class:pressed={isLeftPressed}></div>
        <div class="key" class:pressed={isDownPressed}></div>
        <div class="key" class:pressed={isRightPressed}></div>
    </div>
</div>

<style>
    .keyboard-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
    }
    .keyboard-row {
        display: flex;
        justify-content: center;
        gap: 2px;
    }
    .key {
        width: 40px;
        height: 20px;
        border: 1px solid white;
    }
    .key.pressed {
        background-color: lightblue;
    }
</style>
